using VNeIDSignGateway.Models.Auth;

namespace VNeIDSignGateway.Services;

public interface IVNeIDAuthService
{
    Task<string> GetValidAccessTokenAsync(CancellationToken cancellationToken = default);
    Task<TokenResponse> AuthenticateAsync(string? username = null, string? password = null, CancellationToken cancellationToken = default);
    Task<RefreshTokenResponse> RefreshTokenAsync(string? refreshToken = null, CancellationToken cancellationToken = default);
    TokenResponse? GetCurrentTokenInfo();
    void InvalidateToken();
}
