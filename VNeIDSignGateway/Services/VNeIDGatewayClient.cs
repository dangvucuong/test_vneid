using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using VNeIDSignGateway.Configurations;
using VNeIDSignGateway.Models.Certificate;
using VNeIDSignGateway.Models.Common;
using VNeIDSignGateway.Models.Provider;
using VNeIDSignGateway.Models.Signing;

namespace VNeIDSignGateway.Services;

public class VNeIDGatewayClient : IVNeIDGatewayClient
{
    private readonly HttpClient _httpClient;
    private readonly IVNeIDAuthService _authService;
    private readonly VNeIDGatewayOptions _options;
    private readonly ILogger<VNeIDGatewayClient> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public VNeIDGatewayClient(
        HttpClient httpClient,
        IVNeIDAuthService authService,
        IOptions<VNeIDGatewayOptions> options,
        ILogger<VNeIDGatewayClient> logger)
    {
        _httpClient = httpClient;
        _authService = authService;
        _options = options.Value;
        _logger = logger;

        if (!string.IsNullOrWhiteSpace(_options.BaseUrl))
        {
            _httpClient.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/'));
        }
    }

    public async Task<ApiResponse<List<ProviderItem>>> GetProvidersAsync(
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        return await SendRequestAsync<object, List<ProviderItem>>(
            HttpMethod.Get, 
            "/api/v1/providers", 
            null, 
            requestId, 
            cancellationToken);
    }

    public async Task<ApiResponse<RegisterCertificateResponseData>> RegisterCertificateAsync(
        RegisterCertificateRequest request, 
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.OriginatorCode))
        {
            request.OriginatorCode = _options.OriginatorCode;
        }

        return await SendRequestAsync<RegisterCertificateRequest, RegisterCertificateResponseData>(
            HttpMethod.Post, 
            "/api/v1/certificates/register", 
            request, 
            requestId, 
            cancellationToken);
    }

    public async Task<ApiResponse<CertificateStatusResponseData>> GetCertificateStatusAsync(
        string transactionCode, 
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        var request = new CertificateStatusRequest { TransactionCode = transactionCode };
        return await SendRequestAsync<CertificateStatusRequest, CertificateStatusResponseData>(
            HttpMethod.Post, 
            "/api/v1/certificates/get-status", 
            request, 
            requestId, 
            cancellationToken);
    }

    public async Task<ApiResponse<CertificateListResponseData>> GetCredentialsAsync(
        string citizenPid, 
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        var request = new CertificateListRequest { CitizenPid = citizenPid };
        return await SendRequestAsync<CertificateListRequest, CertificateListResponseData>(
            HttpMethod.Post, 
            "/api/v1/certificates/list", 
            request, 
            requestId, 
            cancellationToken);
    }

    public async Task<ApiResponse<SignHashResponseData>> CreateSignHashAsync(
        SignHashRequest request, 
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.OriginatorCode))
        {
            request.OriginatorCode = _options.OriginatorCode;
        }

        return await SendRequestAsync<SignHashRequest, SignHashResponseData>(
            HttpMethod.Post, 
            "/api/v1/signings/hash", 
            request, 
            requestId, 
            cancellationToken);
    }

    public async Task<ApiResponse<SignHashPollingResponseData>> PollSignHashStatusAsync(
        string handle, 
        string? requestId = null, 
        CancellationToken cancellationToken = default)
    {
        var request = new SignHashPollingRequest { Handle = handle };
        return await SendRequestAsync<SignHashPollingRequest, SignHashPollingResponseData>(
            HttpMethod.Post, 
            "/api/v1/signings/polling", 
            request, 
            requestId, 
            cancellationToken);
    }

    #region Helper Methods

    private async Task<ApiResponse<TResponse>> SendRequestAsync<TRequest, TResponse>(
        HttpMethod method,
        string url,
        TRequest? body,
        string? requestId,
        CancellationToken cancellationToken,
        bool isRetry = false)
    {
        var token = await _authService.GetValidAccessTokenAsync(cancellationToken);
        var actualRequestId = string.IsNullOrWhiteSpace(requestId) ? Guid.NewGuid().ToString() : requestId;

        using var httpRequest = new HttpRequestMessage(method, url);
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        httpRequest.Headers.Add("X-Request-Id", actualRequestId);

        string? requestBodyJson = null;
        if (body != null)
        {
            requestBodyJson = JsonSerializer.Serialize(body, JsonOptions);
            httpRequest.Content = new StringContent(requestBodyJson, Encoding.UTF8, "application/json");
        }

        // Apply partner HMAC signature headers if configured
        ApplyPartnerHmacHeaders(httpRequest, requestBodyJson);

        _logger.LogInformation("Sending {Method} {Url} [RequestId: {RequestId}]", method, url, actualRequestId);

        var response = await _httpClient.SendAsync(httpRequest, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);

        // Handle 401 Unauthorized by retrying once after invalidating cached token
        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized && !isRetry)
        {
            _logger.LogWarning("Received 401 Unauthorized from Gateway. Invalidating token and retrying request...");
            _authService.InvalidateToken();
            return await SendRequestAsync<TRequest, TResponse>(method, url, body, actualRequestId, cancellationToken, isRetry: true);
        }

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Gateway returned HTTP {StatusCode}: {Content}", response.StatusCode, responseContent);
        }

        try
        {
            var apiResult = JsonSerializer.Deserialize<ApiResponse<TResponse>>(responseContent, JsonOptions);
            if (apiResult != null)
            {
                return apiResult;
            }
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to deserialize Gateway response: {Content}", responseContent);
        }

        return new ApiResponse<TResponse>
        {
            Status = ((int)response.StatusCode).ToString(),
            Description = $"HTTP {response.StatusCode}: {responseContent}"
        };
    }

    private void ApplyPartnerHmacHeaders(HttpRequestMessage httpRequest, string? bodyJson)
    {
        if (string.IsNullOrWhiteSpace(_options.PartnerCode) || string.IsNullOrWhiteSpace(_options.PartnerSecretKey))
        {
            return;
        }

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var nonce = Guid.NewGuid().ToString("N");

        httpRequest.Headers.Add("X-Partner-Code", _options.PartnerCode);
        httpRequest.Headers.Add("X-Timestamp", timestamp);
        httpRequest.Headers.Add("X-Nonce", nonce);

        // Sign body with HMAC-SHA256
        var payloadToSign = $"{_options.PartnerCode}:{timestamp}:{nonce}:{bodyJson ?? string.Empty}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_options.PartnerSecretKey));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadToSign));
        var signature = Convert.ToHexString(hashBytes).ToLowerInvariant();

        httpRequest.Headers.Add("X-Signature", signature);
    }

    #endregion
}
