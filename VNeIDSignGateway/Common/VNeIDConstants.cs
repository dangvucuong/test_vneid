namespace VNeIDSignGateway.Common;

public static class VNeIDConstants
{
    public static class WebhookTypes
    {
        public const string CertRegisterTranscode = "CERT_REGISTER_WEBHOOK_TRANSCODE";
        public const string CertRegisterResult = "CERT_REGISTER_WEBHOOK_RESULT";
        public const string SignHashTranscode = "SIGNHASH_WEBHOOK_TRANSCODE";
        public const string SignHashResult = "SIGNHASH_WEBHOOK_RESULT";
    }

    public static class StatusCodes
    {
        public const string TokenMissingOrExpired = "00";
        public const string Success = "01";
        public const string ValidationFailed = "02";
        public const string ResourceNotFound = "03";
        public const string MissingHmacHeader = "20";
        public const string RateLimitExceeded = "21";
        public const string InvalidHmacTimestamp = "22";
        public const string ExpiredHmacTimestamp = "23";
        public const string DuplicateHmacNonce = "24";
        public const string PartnerNotFound = "25";
        public const string InvalidHmacSignature = "26";
        public const string InternalHmacError = "27";
        public const string InternalSystemError = "99";
    }

    public static class CertRequestStatusCodes
    {
        public const int Success = 0;
        public const int Failed = 1;
        public const int Processing = 2;
        public const int CertGeneratedNotActivated = 3;
    }

    public static class SigningStatusCodes
    {
        public const int Success = 0;
        public const int Failed = 1;
        public const int Processing = 2;
        public const int UserRejected = 3;
    }
}
