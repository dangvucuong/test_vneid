using System.Text.Json.Serialization;

namespace VNeIDSignGateway.Models.Certificate;

public class UserInfo
{
    [JsonPropertyName("fullName")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Format: DD/MM/YYYY (e.g. "18/10/2001")
    /// </summary>
    [JsonPropertyName("birthDate")]
    public string BirthDate { get; set; } = string.Empty;

    /// <summary>
    /// Citizen PID / CCCD (12 digits)
    /// </summary>
    [JsonPropertyName("citizenPid")]
    public string CitizenPid { get; set; } = string.Empty;

    [JsonPropertyName("issuingAuthority")]
    public string? IssuingAuthority { get; set; }

    /// <summary>
    /// Format: DD/MM/YYYY (e.g. "01/01/2025")
    /// </summary>
    [JsonPropertyName("dateOfIssue")]
    public string? DateOfIssue { get; set; }

    [JsonPropertyName("gender")]
    public string? Gender { get; set; }

    [JsonPropertyName("phone")]
    public string? Phone { get; set; }

    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("nationalityCode")]
    public string NationalityCode { get; set; } = "VN";

    [JsonPropertyName("permanentAddress")]
    public string? PermanentAddress { get; set; }

    [JsonPropertyName("permanentVillageText")]
    public string? PermanentVillageText { get; set; }

    [JsonPropertyName("permanentCityText")]
    public string? PermanentCityText { get; set; }

    [JsonPropertyName("livingPlaceAddress")]
    public string? LivingPlaceAddress { get; set; }

    [JsonPropertyName("livingPlaceVillageText")]
    public string? LivingPlaceVillageText { get; set; }

    [JsonPropertyName("livingPlaceCityText")]
    public string? LivingPlaceCityText { get; set; }

    [JsonPropertyName("idCardExpireDate")]
    public string? IdCardExpireDate { get; set; }
}

public class RegisterCertificateRequest
{
    [JsonPropertyName("userInfo")]
    public UserInfo UserInfo { get; set; } = new();

    /// <summary>
    /// Provider code, e.g. "HUD-VNPT-SMARTCA", "HUD-VT-CA", "HUD-RARTEST"
    /// </summary>
    [JsonPropertyName("provider")]
    public string Provider { get; set; } = string.Empty;

    /// <summary>
    /// Service pack code, e.g. "VNEID-FREE-6M", "VNEID-FREE-12M"
    /// </summary>
    [JsonPropertyName("servicePackCode")]
    public string ServicePackCode { get; set; } = string.Empty;

    /// <summary>
    /// Originator app code registered with Gateway, e.g. "CA2_SignPlatform"
    /// </summary>
    [JsonPropertyName("originatorCode")]
    public string OriginatorCode { get; set; } = string.Empty;
}

public class RegisterCertificateResponseData
{
    [JsonPropertyName("transactionCode")]
    public string TransactionCode { get; set; } = string.Empty;
}

public class CertificateStatusRequest
{
    [JsonPropertyName("transactionCode")]
    public string TransactionCode { get; set; } = string.Empty;
}

public class CertificateStatusResponseData
{
    [JsonPropertyName("transactionCode")]
    public string? TransactionCode { get; set; }

    /// <summary>
    /// 0: Success, 1: Failed, 2: Processing, 3: Cert generated but not yet activated
    /// </summary>
    [JsonPropertyName("statusCode")]
    public int StatusCode { get; set; }

    /// <summary>
    /// 1: Create new, Extend, Change device, Change app
    /// </summary>
    [JsonPropertyName("requestType")]
    public int RequestType { get; set; }

    [JsonPropertyName("citizenPid")]
    public string? CitizenPid { get; set; }

    [JsonPropertyName("serialNumber")]
    public string? SerialNumber { get; set; }

    [JsonPropertyName("certificateId")]
    public string? CertificateId { get; set; }

    /// <summary>
    /// Base64 encoded X.509 certificate data
    /// </summary>
    [JsonPropertyName("certificateData")]
    public string? CertificateData { get; set; }

    [JsonPropertyName("errorCode")]
    public string? ErrorCode { get; set; }

    [JsonPropertyName("resultCode")]
    public string? ResultCode { get; set; }
}
