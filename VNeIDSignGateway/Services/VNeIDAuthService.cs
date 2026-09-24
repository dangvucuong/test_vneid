using System.Net.Http.Json;
using Microsoft.Extensions.Options;
using VNeIDSignGateway.Configurations;
using VNeIDSignGateway.Models.Auth;

namespace VNeIDSignGateway.Services;

public class VNeIDAuthService : IVNeIDAuthService
{
    public const string HttpClientName = "VNeIDAuth";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly VNeIDGatewayOptions _options;
    private readonly ILogger<VNeIDAuthService> _logger;
    private readonly SemaphoreSlim _semaphore = new(1, 1);

    private string? _cachedAccessToken;
    private string? _cachedRefreshToken;
    private DateTimeOffset _accessTokenExpiry = DateTimeOffset.MinValue;
    private DateTimeOffset _refreshTokenExpiry = DateTimeOffset.MinValue;

    public VNeIDAuthService(
        IHttpClientFactory httpClientFactory,
        IOptions<VNeIDGatewayOptions> options,
        ILogger<VNeIDAuthService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
        _logger = logger;
    }

    private HttpClient CreateClient() => _httpClientFactory.CreateClient(HttpClientName);

    public async Task<string> GetValidAccessTokenAsync(CancellationToken cancellationToken = default)
    {
        // 1. Check if token is still valid (buffer 60 seconds)
        if (!string.IsNullOrEmpty(_cachedAccessToken) && DateTimeOffset.UtcNow.AddSeconds(60) < _accessTokenExpiry)
        {
            return _cachedAccessToken;
        }

        // 2. Thread-safe lock to refresh or acquire new token
        await _semaphore.WaitAsync(cancellationToken);
        try
        {
            // Re-check after entering lock
            if (!string.IsNullOrEmpty(_cachedAccessToken) && DateTimeOffset.UtcNow.AddSeconds(60) < _accessTokenExpiry)
            {
                return _cachedAccessToken;
            }

            // 3. If refresh token is available and not expired, try refreshing
            if (!string.IsNullOrEmpty(_cachedRefreshToken) && DateTimeOffset.UtcNow < _refreshTokenExpiry)
            {
                try
                {
                    _logger.LogInformation("Refreshing VNeID Gateway access token...");
                    var refreshResult = await RefreshTokenAsync(_cachedRefreshToken, cancellationToken);
                    if (refreshResult.IsSuccess && !string.IsNullOrEmpty(refreshResult.AccessToken))
                    {
                        return refreshResult.AccessToken;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to refresh token. Falling back to username/password login.");
                }
            }

            // 4. Otherwise, perform full login with credentials
            _logger.LogInformation("Authenticating with VNeID Gateway using username: {Username}", _options.Username);
            var authResult = await AuthenticateAsync(_options.Username, _options.Password, cancellationToken);
            if (!authResult.IsSuccess || string.IsNullOrEmpty(authResult.AccessToken))
            {
                throw new InvalidOperationException($"VNeID Gateway authentication failed: {authResult.Message ?? "Unknown error"}");
            }

            return authResult.AccessToken;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<TokenResponse> AuthenticateAsync(string? username = null, string? password = null, CancellationToken cancellationToken = default)
    {
        var req = new TokenRequest
        {
            Username = username ?? _options.Username,
            Password = password ?? _options.Password
        };

        var response = await CreateClient().PostAsJsonAsync("/api/v1/auth/token", req, cancellationToken);
        var result = await response.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken: cancellationToken);

        if (result != null && result.IsSuccess && !string.IsNullOrEmpty(result.AccessToken))
        {
            _cachedAccessToken = result.AccessToken;
            _cachedRefreshToken = result.RefreshToken;

            var accessDuration = result.ExpireInSeconds ?? 1800;
            var refreshDuration = result.RefreshTokenExpireInSeconds ?? 604800;

            _accessTokenExpiry = DateTimeOffset.UtcNow.AddSeconds(accessDuration);
            _refreshTokenExpiry = DateTimeOffset.UtcNow.AddSeconds(refreshDuration);

            _logger.LogInformation("Successfully acquired token from VNeID Gateway. Expires in {Duration}s", accessDuration);
        }
        else
        {
            _logger.LogError("Gateway auth failed: {Message}", result?.Message);
        }

        return result ?? new TokenResponse { Message = "No response from Gateway" };
    }

    public async Task<RefreshTokenResponse> RefreshTokenAsync(string? refreshToken = null, CancellationToken cancellationToken = default)
    {
        var tokenToUse = refreshToken ?? _cachedRefreshToken;
        if (string.IsNullOrEmpty(tokenToUse))
        {
            throw new ArgumentException("No refresh token available to refresh.");
        }

        var req = new RefreshTokenRequest { RefreshToken = tokenToUse };
        var response = await CreateClient().PostAsJsonAsync("/api/v1/auth/refresh", req, cancellationToken);
        var result = await response.Content.ReadFromJsonAsync<RefreshTokenResponse>(cancellationToken: cancellationToken);

        if (result != null && result.IsSuccess && !string.IsNullOrEmpty(result.AccessToken))
        {
            _cachedAccessToken = result.AccessToken;
            _cachedRefreshToken = result.RefreshToken ?? _cachedRefreshToken;

            var accessDuration = result.ExpireInSeconds ?? 1800;
            var refreshDuration = result.RefreshTokenExpireInSeconds ?? 604800;

            _accessTokenExpiry = DateTimeOffset.UtcNow.AddSeconds(accessDuration);
            _refreshTokenExpiry = DateTimeOffset.UtcNow.AddSeconds(refreshDuration);

            _logger.LogInformation("Successfully refreshed token. Expires in {Duration}s", accessDuration);
        }
        else
        {
            _logger.LogWarning("Refresh token failed: Status {Status}, Description: {Description}", result?.Status, result?.Description);
        }

        return result ?? new RefreshTokenResponse { Description = "No response from Gateway" };
    }

    public TokenResponse? GetCurrentTokenInfo()
    {
        if (string.IsNullOrEmpty(_cachedAccessToken))
            return null;

        return new TokenResponse
        {
            AccessToken = _cachedAccessToken,
            RefreshToken = _cachedRefreshToken,
            ExpireInSeconds = (int)Math.Max(0, (_accessTokenExpiry - DateTimeOffset.UtcNow).TotalSeconds),
            RefreshTokenExpireInSeconds = (int)Math.Max(0, (_refreshTokenExpiry - DateTimeOffset.UtcNow).TotalSeconds)
        };
    }

    public void InvalidateToken()
    {
        _cachedAccessToken = null;
        _cachedRefreshToken = null;
        _accessTokenExpiry = DateTimeOffset.MinValue;
        _refreshTokenExpiry = DateTimeOffset.MinValue;
    }
}
