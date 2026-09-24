using System.Text.Json.Nodes;
using VNeIDSignGateway.Models.Webhook;

namespace VNeIDSignGateway.Services;

public class WebhookEventStore : IWebhookEventStore
{
    public const int MaxEvents = 300;

    private readonly object _gate = new();
    private readonly List<WebhookEventRecord> _events = new();
    private readonly ILogger<WebhookEventStore> _logger;

    public WebhookEventStore(ILogger<WebhookEventStore> logger)
    {
        _logger = logger;
    }

    public WebhookEventRecord Record(string rawBody, string endpoint, string? requestId)
    {
        var record = Parse(rawBody, endpoint, requestId);

        lock (_gate)
        {
            _events.Add(record);
            var overflow = _events.Count - MaxEvents;
            if (overflow > 0)
            {
                _events.RemoveRange(0, overflow);
            }
        }

        _logger.LogInformation(
            "Stored webhook {Type} id={Id} txnId={TxnId} transactionCode={TransactionCode} handle={Handle}",
            record.Type, record.Id, record.TxnId, record.TransactionCode, record.Handle);

        return record;
    }

    public IReadOnlyList<WebhookEventRecord> Query(DateTimeOffset? since, int limit)
    {
        if (limit <= 0)
        {
            limit = 100;
        }

        limit = Math.Min(limit, MaxEvents);

        lock (_gate)
        {
            IEnumerable<WebhookEventRecord> query = _events;
            if (since.HasValue)
            {
                query = query.Where(e => e.ReceivedAt > since.Value);
            }

            return query.TakeLast(limit).ToList();
        }
    }

    private static WebhookEventRecord Parse(string rawBody, string endpoint, string? requestId)
    {
        string type = "UNKNOWN";
        string? transactionCode = null;
        string? handle = null;
        string? txnId = null;
        int? status = null;
        JsonNode? data = null;

        try
        {
            var root = JsonNode.Parse(rawBody);
            type = root?["type"]?.GetValue<string>() ?? type;
            var dataNode = root?["data"];
            if (dataNode != null)
            {
                data = JsonNode.Parse(dataNode.ToJsonString());
                transactionCode = ReadString(dataNode, "transactionCode");
                handle = ReadString(dataNode, "handle");
                txnId = ReadString(dataNode, "txnId");
                if (dataNode["status"] is JsonValue statusValue && statusValue.TryGetValue<int>(out var parsedStatus))
                {
                    status = parsedStatus;
                }
            }
        }
        catch (Exception ex) when (ex is InvalidOperationException or FormatException or System.Text.Json.JsonException)
        {
            type = "UNPARSED";
        }

        return new WebhookEventRecord
        {
            Id = Guid.NewGuid().ToString("N"),
            ReceivedAt = DateTimeOffset.UtcNow,
            Type = type,
            TransactionCode = transactionCode,
            Handle = handle,
            TxnId = txnId,
            Status = status,
            RequestId = requestId,
            Endpoint = endpoint,
            Data = data
        };
    }

    private static string? ReadString(JsonNode node, string name)
    {
        return node[name] is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;
    }
}
