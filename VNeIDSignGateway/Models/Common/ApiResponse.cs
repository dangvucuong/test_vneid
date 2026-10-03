using System.Text.Json.Serialization;

namespace VNeIDSignGateway.Models.Common;

/// <summary>
/// Standard API response envelope returned by RSVAN Gateway
/// </summary>
public class ApiResponse<T>
{
    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("data")]
    public T? Data { get; set; }

    /// <summary>
    /// X-Request-Id đã gửi sang RSVAN. Lần tra cứu sau phải dùng lại đúng mã này.
    /// </summary>
    [JsonPropertyName("requestId")]
    public string? RequestId { get; set; }

    [JsonIgnore]
    public bool IsSuccess => Status == "01";
}
