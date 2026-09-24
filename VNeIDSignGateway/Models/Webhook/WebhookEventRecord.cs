using System.Text.Json.Nodes;

namespace VNeIDSignGateway.Models.Webhook;

public class WebhookEventRecord
{
    public string Id { get; set; } = string.Empty;

    public DateTimeOffset ReceivedAt { get; set; }

    public string Type { get; set; } = string.Empty;

    public string? TransactionCode { get; set; }

    public string? Handle { get; set; }

    public string? TxnId { get; set; }

    public int? Status { get; set; }

    public string? RequestId { get; set; }

    public string Endpoint { get; set; } = string.Empty;

    public JsonNode? Data { get; set; }
}

public class WebhookEventListResponse
{
    public DateTimeOffset ServerTime { get; set; }

    public IReadOnlyList<WebhookEventRecord> Events { get; set; } = Array.Empty<WebhookEventRecord>();
}
