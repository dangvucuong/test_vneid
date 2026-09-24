namespace VNeIDSignGateway.Configurations;

public class VNeIDGatewayOptions
{
    public const string SectionName = "VNeIDGateway";

    /// <summary>
    /// Base URL of Gateway (e.g. https://uat-rsvan-gw.vmgmedia.vn)
    /// </summary>
    public string BaseUrl { get; set; } = "https://uat-rsvan-gw.vmgmedia.vn";

    /// <summary>
    /// Account username provided by Gateway
    /// </summary>
    public string Username { get; set; } = "CA2";

    /// <summary>
    /// Account password provided by Gateway
    /// </summary>
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Default application code assigned to partner (e.g. CA2_SignPlatform or CA2_MobileSign)
    /// </summary>
    public string OriginatorCode { get; set; } = "CA2_SignPlatform";

    /// <summary>
    /// Optional Partner Code for HMAC signed request headers
    /// </summary>
    public string? PartnerCode { get; set; }

    /// <summary>
    /// Optional Partner Secret Key for HMAC-SHA256 request signature
    /// </summary>
    public string? PartnerSecretKey { get; set; }

    /// <summary>
    /// Secret Key provided to verify incoming Webhook signature (X-Webhook-Signature)
    /// </summary>
    public string WebhookSecretKey { get; set; } = string.Empty;

    /// <summary>
    /// VNeID Universal Link base URL (e.g. https://universal.dancuquocgia.com/share)
    /// </summary>
    public string UniversalLinkShareBaseUrl { get; set; } = "https://universal.dancuquocgia.com/share";

    /// <summary>
    /// VNeID Universal Link for re-entering activation screen
    /// </summary>
    public string UniversalLinkActiveBaseUrl { get; set; } = "http://universal.dancuquocgia.com/screen/SmartCAActive/id=";

    /// <summary>
    /// Partner's app universal link configured with RAR HUB to redirect back after activation
    /// </summary>
    public string? AppCallbackUrl { get; set; }
}
