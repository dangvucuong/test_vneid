using VNeIDSignGateway.Models.Webhook;

namespace VNeIDSignGateway.Services;

public interface IWebhookEventStore
{
    WebhookEventRecord Record(string rawBody, string endpoint, string? requestId);

    IReadOnlyList<WebhookEventRecord> Query(DateTimeOffset? since, int limit);
}
