using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using VNeIDSignGateway.Common;
using VNeIDSignGateway.Models.Webhook;
using VNeIDSignGateway.Services;

namespace VNeIDSignGateway.Controllers;

[ApiController]
[Route("api/webhook/vneid")]
[Produces("application/json")]
public class VNeIDWebhookController : ControllerBase
{
    private readonly IWebhookValidator _validator;
    private readonly IWebhookEventStore _eventStore;
    private readonly ILogger<VNeIDWebhookController> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public VNeIDWebhookController(
        IWebhookValidator validator,
        IWebhookEventStore eventStore,
        ILogger<VNeIDWebhookController> logger)
    {
        _validator = validator;
        _eventStore = eventStore;
        _logger = logger;
    }

    /// <summary>
    /// Webhook 1: Nhận mã giao dịch đăng ký txnId (App-to-App Universal Link)
    /// Event: CERT_REGISTER_WEBHOOK_TRANSCODE
    /// </summary>
    [HttpPost("txn-id")]
    [ProducesResponseType(typeof(WebhookCallbackResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleRegisterTranscodeWebhookAsync(
        [FromHeader(Name = "X-Webhook-Signature")] string? signature,
        [FromHeader(Name = "X-Request-Id")] string? requestId)
    {
        var (isValid, rawBody) = await ValidateSignatureAsync(signature);
        if (!isValid)
        {
            return StatusCode(StatusCodes.Status400BadRequest, WebhookCallbackResponse.Fail("26", "Chữ ký webhook không hợp lệ"));
        }

        var payload = JsonSerializer.Deserialize<WebhookPayload<CertRegisterTranscodeData>>(rawBody, JsonOptions);
        if (payload?.Data == null)
        {
            return StatusCode(StatusCodes.Status400BadRequest, WebhookCallbackResponse.Fail("02", "Payload rỗng hoặc không đúng định dạng"));
        }

        _logger.LogInformation(">>> [WEBHOOK] Received txnId: {TxnId} for TransactionCode: {TransactionCode}, Status: {Status}",
            payload.Data.TxnId, payload.Data.TransactionCode, payload.Data.Status);

        _eventStore.Record(rawBody, "txn-id", requestId);

        return Ok(WebhookCallbackResponse.Ok());
    }

    /// <summary>
    /// Webhook 2: Nhận thông tin chứng thư và kết quả đăng ký CCTS
    /// Event: CERT_REGISTER_WEBHOOK_RESULT
    /// </summary>
    [HttpPost("cert-result")]
    [ProducesResponseType(typeof(WebhookCallbackResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleCertResultWebhookAsync(
        [FromHeader(Name = "X-Webhook-Signature")] string? signature,
        [FromHeader(Name = "X-Request-Id")] string? requestId)
    {
        var (isValid, rawBody) = await ValidateSignatureAsync(signature);
        if (!isValid)
        {
            return StatusCode(StatusCodes.Status400BadRequest, WebhookCallbackResponse.Fail("26", "Chữ ký webhook không hợp lệ"));
        }

        var payload = JsonSerializer.Deserialize<WebhookPayload<CertRegisterResultData>>(rawBody, JsonOptions);
        if (payload?.Data == null)
        {
            return StatusCode(StatusCodes.Status400BadRequest, WebhookCallbackResponse.Fail("02", "Payload rỗng hoặc không đúng định dạng"));
        }

        _logger.LogInformation(">>> [WEBHOOK] Received Cert Result for TransactionCode: {TransactionCode}, Status: {Status}, Serial: {SerialNumber}",
            payload.Data.TransactionCode, payload.Data.Status, payload.Data.SerialNumber);

        _eventStore.Record(rawBody, "cert-result", requestId);

        return Ok(WebhookCallbackResponse.Ok());
    }

    /// <summary>
    /// Webhook 3: Nhận thông tin mã giao dịch ký txnId
    /// Event: SIGNHASH_WEBHOOK_TRANSCODE
    /// </summary>
    [HttpPost("sign-transcode")]
    [ProducesResponseType(typeof(WebhookCallbackResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleSignTranscodeWebhookAsync(
        [FromHeader(Name = "X-Webhook-Signature")] string? signature,
        [FromHeader(Name = "X-Request-Id")] string? requestId)
    {
        var (isValid, rawBody) = await ValidateSignatureAsync(signature);
        if (!isValid)
        {
            return StatusCode(StatusCodes.Status400BadRequest, WebhookCallbackResponse.Fail("26", "Chữ ký webhook không hợp lệ"));
        }

        var payload = JsonSerializer.Deserialize<WebhookPayload<SignHashTranscodeData>>(rawBody, JsonOptions);
        if (payload?.Data == null)
        {
            return StatusCode(StatusCodes.Status400BadRequest, WebhookCallbackResponse.Fail("02", "Payload rỗng hoặc không đúng định dạng"));
        }

        _logger.LogInformation(">>> [WEBHOOK] Received Signing txnId: {TxnId} for Handle: {Handle}, Status: {Status}",
            payload.Data.TxnId, payload.Data.Handle, payload.Data.Status);

        _eventStore.Record(rawBody, "sign-transcode", requestId);

        return Ok(WebhookCallbackResponse.Ok());
    }

    /// <summary>
    /// Webhook 4: Nhận kết quả ký (signatures)
    /// Event: SIGNHASH_WEBHOOK_RESULT
    /// </summary>
    [HttpPost("sign-result")]
    [ProducesResponseType(typeof(WebhookCallbackResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleSignResultWebhookAsync(
        [FromHeader(Name = "X-Webhook-Signature")] string? signature,
        [FromHeader(Name = "X-Request-Id")] string? requestId)
    {
        var (isValid, rawBody) = await ValidateSignatureAsync(signature);
        if (!isValid)
        {
            return StatusCode(StatusCodes.Status400BadRequest, WebhookCallbackResponse.Fail("26", "Chữ ký webhook không hợp lệ"));
        }

        var payload = JsonSerializer.Deserialize<WebhookPayload<SignHashResultData>>(rawBody, JsonOptions);
        if (payload?.Data == null)
        {
            return StatusCode(StatusCodes.Status400BadRequest, WebhookCallbackResponse.Fail("02", "Payload rỗng hoặc không đúng định dạng"));
        }

        _logger.LogInformation(">>> [WEBHOOK] Received Signatures for Handle: {Handle}, SignaturesCount: {Count}, Status: {Status}",
            payload.Data.Handle, payload.Data.Signatures?.Count ?? 0, payload.Data.Status);

        _eventStore.Record(rawBody, "sign-result", requestId);

        return Ok(WebhookCallbackResponse.Ok());
    }

    /// <summary>
    /// Unified Webhook: Điểm tiếp nhận chung cho tất cả các loại sự kiện từ Gateway
    /// </summary>
    [HttpPost("unified")]
    [ProducesResponseType(typeof(WebhookCallbackResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> HandleUnifiedWebhookAsync(
        [FromHeader(Name = "X-Webhook-Signature")] string? signature,
        [FromHeader(Name = "X-Request-Id")] string? requestId)
    {
        var (isValid, rawBody) = await ValidateSignatureAsync(signature);
        if (!isValid)
        {
            return StatusCode(StatusCodes.Status400BadRequest, WebhookCallbackResponse.Fail("26", "Chữ ký webhook không hợp lệ"));
        }

        using var jsonDoc = JsonDocument.Parse(rawBody);
        var root = jsonDoc.RootElement;
        var eventType = root.TryGetProperty("type", out var typeProp) ? typeProp.GetString() : null;

        _logger.LogInformation(">>> [WEBHOOK UNIFIED] Dispatching event: {EventType}", eventType);

        switch (eventType)
        {
            case VNeIDConstants.WebhookTypes.CertRegisterTranscode:
                var transcodePayload = JsonSerializer.Deserialize<WebhookPayload<CertRegisterTranscodeData>>(rawBody, JsonOptions);
                _logger.LogInformation("Handled CERT_REGISTER_WEBHOOK_TRANSCODE: txnId = {TxnId}", transcodePayload?.Data?.TxnId);
                break;

            case VNeIDConstants.WebhookTypes.CertRegisterResult:
                var certResultPayload = JsonSerializer.Deserialize<WebhookPayload<CertRegisterResultData>>(rawBody, JsonOptions);
                _logger.LogInformation("Handled CERT_REGISTER_WEBHOOK_RESULT: serial = {Serial}", certResultPayload?.Data?.SerialNumber);
                break;

            case VNeIDConstants.WebhookTypes.SignHashTranscode:
                var signTranscodePayload = JsonSerializer.Deserialize<WebhookPayload<SignHashTranscodeData>>(rawBody, JsonOptions);
                _logger.LogInformation("Handled SIGNHASH_WEBHOOK_TRANSCODE: txnId = {TxnId}", signTranscodePayload?.Data?.TxnId);
                break;

            case VNeIDConstants.WebhookTypes.SignHashResult:
                var signResultPayload = JsonSerializer.Deserialize<WebhookPayload<SignHashResultData>>(rawBody, JsonOptions);
                _logger.LogInformation("Handled SIGNHASH_WEBHOOK_RESULT: signatures count = {Count}", signResultPayload?.Data?.Signatures?.Count);
                break;

            default:
                _logger.LogWarning("Unknown webhook event type: {EventType}. Body: {Body}", eventType, rawBody);
                break;
        }

        _eventStore.Record(rawBody, "unified", requestId);

        return Ok(WebhookCallbackResponse.Ok());
    }

    private async Task<(bool IsValid, string RawBody)> ValidateSignatureAsync(string? signature)
    {
        Request.EnableBuffering();
        using var reader = new StreamReader(Request.Body, Encoding.UTF8, leaveOpen: true);
        var rawBody = await reader.ReadToEndAsync();
        Request.Body.Position = 0;

        var isValid = _validator.ValidateSignature(rawBody, signature);
        return (isValid, rawBody);
    }
}
