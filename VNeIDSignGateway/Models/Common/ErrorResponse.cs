using System.Text.Json.Serialization;

namespace VNeIDSignGateway.Models.Common;

public class ErrorResponse
{
    [JsonPropertyName("error")]
    public string? Error { get; set; }

    [JsonPropertyName("errorDescription")]
    public string? ErrorDescription { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }
}
