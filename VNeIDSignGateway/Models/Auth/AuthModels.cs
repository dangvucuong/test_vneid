using System.Text.Json.Serialization;

namespace VNeIDSignGateway.Models.Auth;

public class TokenRequest
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;

    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
}

public class TokenResponse
{
    [JsonPropertyName("accessToken")]
    public string? AccessToken { get; set; }

    [JsonPropertyName("refreshToken")]
    public string? RefreshToken { get; set; }

    [JsonPropertyName("expireInSeconds")]
    public int? ExpireInSeconds { get; set; }

    [JsonPropertyName("refreshTokenExpireInSeconds")]
    public int? RefreshTokenExpireInSeconds { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonIgnore]
    public bool IsSuccess => !string.IsNullOrEmpty(AccessToken);
}

public class RefreshTokenRequest
{
    [JsonPropertyName("refreshToken")]
    public string RefreshToken { get; set; } = string.Empty;
}

public class RefreshTokenResponse
{
    [JsonPropertyName("accessToken")]
    public string? AccessToken { get; set; }

    [JsonPropertyName("refreshToken")]
    public string? RefreshToken { get; set; }

    [JsonPropertyName("expireInSeconds")]
    public int? ExpireInSeconds { get; set; }

    [JsonPropertyName("refreshTokenExpireInSeconds")]
    public int? RefreshTokenExpireInSeconds { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonIgnore]
    public bool IsSuccess => !string.IsNullOrEmpty(AccessToken);
}
