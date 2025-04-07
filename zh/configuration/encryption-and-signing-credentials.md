# 加密和签名凭证 <Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

为了保护它们生成的令牌，OpenIddict 客户端和服务器堆栈使用两种类型的凭证：
  - **签名凭证用于防止篡改**。它们可以是对称的（如 RSA 或 ECDSA 密钥）或非对称的。
  - **加密凭证用于确保令牌内容不能被恶意方读取**。它们可以是对称的（如 RSA 密钥）或非对称的。

> [!TIP]
> 使用可选的 ASP.NET Core 数据保护集成生成的令牌依赖于它们自己的密钥环，与本文档中讨论的凭证不同。
>
> 有关数据保护的更多信息，请访问 [ASP.NET Core 数据保护](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/introduction)。

> [!IMPORTANT]
> 虽然技术上可以在 OpenIddict 客户端和 OpenIddict 服务器中重用相同的凭证集，但建议使用单独的密钥/证书。

## 在客户端或服务器选项中注册凭证 <Badge type="warning" text="client" /><Badge type="danger" text="server" />

OpenIddict 允许注册一个或多个密钥（原始密钥或嵌入在 X.509 证书中）。

> [!NOTE]
> 当注册多个密钥/证书时（这对于实现密钥轮换很有用），OpenIddict 根据以下算法选择最合适的密钥：
>  - 对称密钥总是优先选择，除了身份令牌，它只能使用非对称密钥签名。
>  - 嵌入在 X.509 证书中的非对称密钥根据 `NotAfter` 和 `NotBefore` 日期排序（尚未生效的证书
> 不会被 OpenIddict 使用，具有最远过期日期的证书总是优先）。
>  - X.509 证书总是优先于原始 RSA/ECDSA 密钥。

### 注册临时密钥

对于开发目的，可以使用临时密钥来签名或加密令牌，这种密钥不会持久化或在不同实例间共享：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.AddEphemeralEncryptionKey()
               .AddEphemeralSigningKey();
    })
    .AddServer(options =>
    {
        options.AddEphemeralEncryptionKey()
               .AddEphemeralSigningKey();
    });
```

> [!NOTE]
> `options.AddEphemeralEncryptionKey()` 生成一个非对称 RSA 密钥，它不会直接用于加密令牌，而是用于加密一个中间*每个令牌*的对称密钥，
> 然后使用 [AES](https://datatracker.ietf.org/doc/html/rfc7518#section-5.2.6) 首先加密令牌内容。
>
> 有关此机制的更多信息，请阅读 [使用 RSAES OAEP 进行密钥加密](https://datatracker.ietf.org/doc/html/rfc7518#section-4.3)。

### 注册开发证书

对于开发目的，OpenIddict 可以生成并存储证书在运行应用程序主机的用户账户的证书存储中。
与临时密钥不同，开发证书会被持久化 - 但不会在不同实例间共享 - 并且会在应用程序主机重启时被重用。

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.AddDevelopmentEncryptionCertificate()
               .AddDevelopmentSigningCertificate();
    })
    .AddServer(options =>
    {
        options.AddDevelopmentEncryptionCertificate()
               .AddDevelopmentSigningCertificate();
    });
```

> [!WARNING]
> 此功能在 .NET Framework 4.6.2 上不可用：如果在运行时找不到有效的开发证书且需要生成新证书，
> 调用 `options.AddDevelopmentEncryptionCertificate()` 或 `options.AddDevelopmentSigningCertificate()`
> 将导致抛出 `PlatformNotSupportedException`。

> [!CAUTION]
> `options.AddDevelopmentEncryptionCertificate()` 或 `options.AddDevelopmentSigningCertificate()` 不能在部署在 IIS 或 Azure App Service 上的应用程序中使用：
> 在 IIS 或 Azure App Service 上尝试使用它们将在运行时抛出异常（除非应用程序池配置为加载用户配置文件）。
> 为避免这种情况，请考虑创建自签名证书并将其存储在主机机器的 X.509 证书存储中。

### 注册密钥

要注册签名或加密密钥，可以向 `options.AddSigningKey()`/`options.AddEncryptionKey()` 方法提供 `SecurityKey` 的实例
（通常是 `SymmetricSecurityKey` 或 `RsaSecurityKey`）：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.AddEncryptionKey(new SymmetricSecurityKey(
            Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));
    })
    .AddServer(options =>
    {
        options.AddEncryptionKey(new SymmetricSecurityKey(
            Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));
    });
```

> [!NOTE]
> 虽然签名密钥可以是对称的或非对称的，但 OpenIddict 服务器要求至少注册一个非对称密钥来签名身份令牌。
> 如果同时注册了非对称和对称签名密钥，对称密钥将始终优先用于保护访问令牌、
> 授权代码或刷新令牌，而非对称密钥将用于签名身份令牌，这些令牌旨在公开验证。

### 注册证书（推荐用于生产就绪场景）

要注册签名或加密证书，可以使用 `X509Certificate2` 的实例调用 `options.AddSigningCertificate()`/`options.AddEncryptionCertificate()` 方法。
或者，也可以提供在操作系统的机器或用户证书存储中标识证书的唯一 `thumbprint`。

**在生产环境中，建议使用两个 RSA 证书，与用于 HTTPS 的证书不同：一个用于加密，一个用于签名**。
可以使用 .NET Core 的 `CertificateRequest` API 在本地生成和自签名证书：

```csharp
using var algorithm = RSA.Create(keySizeInBits: 2048);

var subject = new X500DistinguishedName("CN=Fabrikam Server Encryption Certificate");
var request = new CertificateRequest(subject, algorithm, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
request.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.KeyEncipherment, critical: true));

var certificate = request.CreateSelfSigned(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(2));

File.WriteAllBytes("server-encryption-certificate.pfx", certificate.Export(X509ContentType.Pfx, string.Empty));
```

```csharp
using var algorithm = RSA.Create(keySizeInBits: 2048);

var subject = new X500DistinguishedName("CN=Fabrikam Server Signing Certificate");
var request = new CertificateRequest(subject, algorithm, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
request.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature, critical: true));

var certificate = request.CreateSelfSigned(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(2));

File.WriteAllBytes("server-signing-certificate.pfx", certificate.Export(X509ContentType.Pfx, string.Empty));
```

存储证书的最佳位置将取决于您的主机：
  - 对于 IIS 应用程序，[将证书存储在机器存储中](https://www.sonicwall.com/support/knowledge-base/how-can-i-import-certificates-into-the-ms-windows-local-machine-certificate-store/170504615105398/) 是推荐选项。
  - 在 Azure 上，可以使用特殊的 `WEBSITE_LOAD_CERTIFICATES` 标志上传证书并将其暴露给 Azure App Service 应用程序。
有关更多信息，请访问 [在 Azure App Service 中的代码中使用 TLS/SSL 证书](https://docs.microsoft.com/en-us/azure/app-service/configure-ssl-certificate-in-code)。

## 在 API 项目的验证选项中导入凭证 <Badge type="tip" text="validation" />

### 使用 `options.UseLocalServer()` 集成

当 API 和授权服务器是同一项目的一部分时，可以通过调用 `options.UseLocalServer()` 轻松导入签名和加密凭证：

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.UseLocalServer();
    });
```

### 使用 OpenID Connect 发现（仅限非对称签名密钥）

当 API 和授权服务器托管在不同的应用程序中时，可以使用
[标准 OpenID Connect 发现](https://openid.net/specs/openid-connect-discovery-1_0.html) 自动导入非对称签名密钥：

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.SetIssuer("https://localhost:44319/");
        options.UseSystemNetHttp();
    });
```

> [!WARNING]
> 使用 OpenID Connect 发现需要启用 `System.Net.Http` 集成：确保引用了
> `OpenIddict.Validation.SystemNetHttp` 包并调用 `UseSystemNetHttp()` 来启用它。
>
> 有关更多信息，请阅读 [`System.Net.Http` 集成](/integrations/system-net-http.md)。

### 在令牌验证参数中注册对称签名密钥

与非对称签名密钥不同，对称密钥 - 用于基于 HMAC 的算法，如 [HS256](https://datatracker.ietf.org/doc/html/rfc7518#section-3.2) - 不能
安全地通过 OpenID Connect 发现端点暴露。因此，它们不能被 OpenIddict 验证处理程序自动导入。
对于需要使用对称签名密钥的应用程序，可以使用高级配置 API 在令牌验证选项中注册它：

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.Configure(options => options.TokenValidationParameters.IssuerSigningKey =
            new SymmetricSecurityKey(
                Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));
    });
```

### 注册加密密钥或证书

要导入加密密钥/证书，可以使用与 OpenIddict 服务器功能相同的重载：

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.AddEncryptionCertificate("b82f36609cdaff9a95de60e8d5ac774b2e496c4b");
    });
```
