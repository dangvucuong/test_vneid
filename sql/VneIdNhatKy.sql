USE SignFlatform;
GO

IF OBJECT_ID(N'dbo.VneIdNhatKy', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.VneIdNhatKy
    (
        Id              BIGINT IDENTITY(1, 1) NOT NULL PRIMARY KEY,
        ThoiGian        DATETIME2(3) NOT NULL CONSTRAINT DF_VneIdNhatKy_ThoiGian DEFAULT (SYSDATETIME()),
        Loai            NVARCHAR(30) NOT NULL,
        RequestId       NVARCHAR(64) NULL,
        Handle          NVARCHAR(64) NULL,
        TransactionCode NVARCHAR(64) NULL,
        TxnId           NVARCHAR(64) NULL,
        CitizenPid      NVARCHAR(20) NULL,
        Email           NVARCHAR(256) NULL,
        IdTaiLieu       INT NULL,
        OriginatorCode  NVARCHAR(64) NULL,
        TrangThai       NVARCHAR(50) NULL,
        MoTa            NVARCHAR(1000) NULL,
        HttpStatus      INT NULL,
        ChuKyHopLe      BIT NULL,
        NoiDungGui      NVARCHAR(MAX) NULL,
        NoiDungNhan     NVARCHAR(MAX) NULL
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_VneIdNhatKy_Handle' AND object_id = OBJECT_ID(N'dbo.VneIdNhatKy'))
    CREATE INDEX IX_VneIdNhatKy_Handle ON dbo.VneIdNhatKy (Handle);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_VneIdNhatKy_RequestId' AND object_id = OBJECT_ID(N'dbo.VneIdNhatKy'))
    CREATE INDEX IX_VneIdNhatKy_RequestId ON dbo.VneIdNhatKy (RequestId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_VneIdNhatKy_TransactionCode' AND object_id = OBJECT_ID(N'dbo.VneIdNhatKy'))
    CREATE INDEX IX_VneIdNhatKy_TransactionCode ON dbo.VneIdNhatKy (TransactionCode);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_VneIdNhatKy_ThoiGian' AND object_id = OBJECT_ID(N'dbo.VneIdNhatKy'))
    CREATE INDEX IX_VneIdNhatKy_ThoiGian ON dbo.VneIdNhatKy (ThoiGian);
GO
