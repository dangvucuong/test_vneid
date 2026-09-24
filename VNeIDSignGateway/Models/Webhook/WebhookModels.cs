using System.Text.Json.Serialization;

namespace VNeIDSignGateway.Models.Webhook;

/// <summary>
/// Generic Webhook event envelope sent by RSVAN Gateway
/// </summary>
public class WebhookPayload<T>
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("attempt")]
    public int Attempt { get; set; }

    [JsonPropertyName("data")]
    public T? Data { get; set; }
}

/// <summary>
/// Event: CERT_REGISTER_WEBHOOK_TRANSCODE
/// Provides txnId for initiating App-to-App VNeID universal link
/// </summary>
public class CertRegisterTranscodeData
{
    [JsonPropertyName("transactionCode")]
    public string TransactionCode { get; set; } = string.Empty;

    /// <summary>
    /// 0: Success, 1: Failed
    /// </summary>
    [JsonPropertyName("status")]
    public int Status { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// VNeID Platform transaction code (used for Universal Link)
    /// </summary>
    [JsonPropertyName("txnId")]
    public string TxnId { get; set; } = string.Empty;
}

/// <summary>
/// Event: CERT_REGISTER_WEBHOOK_RESULT
/// Contains final certificate details after citizen completes activation on VNeID
/// </summary>
public class CertRegisterResultData
{
    [JsonPropertyName("transactionCode")]
    public string TransactionCode { get; set; } = string.Empty;

    [JsonPropertyName("serialNumber")]
    public string? SerialNumber { get; set; }

    [JsonPropertyName("certificateId")]
    public string? CertificateId { get; set; }

    /// <summary>
    /// Base64 X.509 certificate data
    /// </summary>
    [JsonPropertyName("certificateData")]
    public string? CertificateData { get; set; }

    /// <summary>
    /// 0: Success, 1: Failed
    /// </summary>
    [JsonPropertyName("status")]
    public int Status { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }
}

/// <summary>
/// Event: SIGNHASH_WEBHOOK_TRANSCODE
/// Provides txnId for App-to-App redirection during signing
/// </summary>
public class SignHashTranscodeData
{
    [JsonPropertyName("txnId")]
    public string TxnId { get; set; } = string.Empty;

    /// <summary>
    /// 0: Success, 1: Failed
    /// </summary>
    [JsonPropertyName("status")]
    public int Status { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    [JsonPropertyName("handle")]
    public string Handle { get; set; } = string.Empty;
}

/// <summary>
/// Event: SIGNHASH_WEBHOOK_RESULT
/// Provides the cryptographic signatures after citizen confirms on VNeID
/// </summary>
public class SignHashResultData
{
    [JsonPropertyName("handle")]
    public string Handle { get; set; } = string.Empty;

    /// <summary>
    /// 0: Success, 1: Failed, 3: Citizen rejected
    /// </summary>
    [JsonPropertyName("status")]
    public int Status { get; set; }

    [JsonPropertyName("description")]
    public string? Description { get; set; }

    /// <summary>
    /// Base64 digital signatures corresponding to digestValues
    /// </summary>
    [JsonPropertyName("signatures")]
    public List<string> Signatures { get; set; } = new();
}

/// <summary>
/// Response returned by partner's webhook endpoint back to Gateway
/// </summary>
public class WebhookCallbackResponse
{
    [JsonPropertyName("error")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Error { get; set; }

    [JsonPropertyName("errorDescription")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? ErrorDescription { get; set; }

    public static WebhookCallbackResponse Ok() => new();
    public static WebhookCallbackResponse Fail(string code, string desc) => new() { Error = code, ErrorDescription = desc };
}
