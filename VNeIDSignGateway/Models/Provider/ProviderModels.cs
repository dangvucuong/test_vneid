using System.Text.Json.Serialization;

namespace VNeIDSignGateway.Models.Provider;

public class ProviderItem
{
    [JsonPropertyName("providerName")]
    public string? ProviderName { get; set; }

    [JsonPropertyName("provider")]
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// 1: Active, 0: Inactive
    /// </summary>
    [JsonPropertyName("status")]
    public int Status { get; set; }

    [JsonPropertyName("servicePackList")]
    public List<ServicePackItem> ServicePackList { get; set; } = new();
}

public class ServicePackItem
{
    [JsonPropertyName("servicePackCode")]
    public string ServicePackCode { get; set; } = string.Empty;

    [JsonPropertyName("servicePackName")]
    public string? ServicePackName { get; set; }

    [JsonPropertyName("servicePackMonth")]
    public int ServicePackMonth { get; set; }

    [JsonPropertyName("unitPrice")]
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// 1: Free package (each citizen gets 1 free cert), 0: Paid package
    /// </summary>
    [JsonPropertyName("free")]
    public int Free { get; set; }
}
