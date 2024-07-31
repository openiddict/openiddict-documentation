# Encryption and signing credentials

To protect the tokens they generate, the OpenIddict client and server stacks use 2 types of credentials:
  - **Signing credentials are used to protect against tampering**. They can be either asymmetric (e.g a RSA or ECDSA key) or symmetric.
  - **Encryption credentials are used to ensure the content of tokens cannot be read by malicious parties**. They can be either asymmetric (e.g a RSA key) or symmetric.

> [!TIP]
> Tokens generated using the opt-in ASP.NET Core Data Protection integration rely on their own key ring, distinct from the credentials discussed in this documentation.
>
> For more information about Data Protection, visit [ASP.NET Core Data Protection](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/introduction).

> [!IMPORTANT]
> While you can technically reuse the same set of credentials for both the OpenIddict client and the OpenIddict server, it is recommended to use separate keys/certificates.

## Registering credentials in the client or server options

OpenIddict allows registering one or multiple keys (raw keys or embedded in X.509 certificates).

> [!NOTE]
> When multiple keys/certificates are registered (which can be useful to implement keys rotation), OpenIddict chooses the most appropriate key based on the following algorithm:
>  - Symmetric keys are always chosen first, except for identity tokens, that can only be signed using asymmetric keys.
>  - Asymmetric keys embedded in X.509 certificates are ordered based on the `NotAfter` and `NotBefore` dates (certificates that are not yet valid
> are not used by OpenIddict and certificates with the furthest expiration date are always preferred).
>  - X.509 certificates are always preferred to raw RSA/ECDSA keys.

### Registering an ephemeral key

For development purposes, an ephemeral key – that is not persisted or shared across instances – can be used to sign or encrypt tokens:

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
> `options.AddEphemeralEncryptionKey()` generates an asymmetric RSA key which is not directly used as-is to encrypt the tokens but is used to encrypt an
> intermediate *per-token* symmetric key with which the token content is first encrypted using [AES](https://datatracker.ietf.org/doc/html/rfc7518#section-5.2.6).
>
> For more information about this mechanism, read [Key Encryption with RSAES OAEP](https://datatracker.ietf.org/doc/html/rfc7518#section-4.3).

### Registering a development certificate

For development purposes, a certificate can be generated and stored by OpenIddict in the certificates store of the user account running the application host.
Unlike ephemeral keys, development certificates are persisted - but not shared across instances - and will be reused when the application host is restarted.

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
> This feature is not available on .NET Framework 4.6.1: calling `options.AddDevelopmentEncryptionCertificate()` or `options.AddDevelopmentSigningCertificate()`
> will result in a `PlatformNotSupportedException` being thrown at runtime if no valid development certificate can be found and a new one must be generated.

> [!CAUTION]
> `options.AddDevelopmentEncryptionCertificate()` or `options.AddDevelopmentSigningCertificate()` cannot be used in applications deployed on IIS or Azure App Service:
> trying to use them on IIS or Azure App Service will result in an exception being thrown at runtime (unless the application pool is configured to load a user profile).
> To avoid that, consider creating self-signed certificates and storing them in the X.509 certificates store of the host machine(s).

### Registering a key

To register a signing or encryption key, an instance of a `SecurityKey` - typically a `SymmetricSecurityKey` or a `RsaSecurityKey` -
can be provided to the `options.AddSigningKey()`/`options.AddEncryptionKey()` methods:

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
> While signing keys can be either symmetric or asymmetric, the OpenIddict server requires registering at least one asymmetric key to sign identity tokens.
> If both an asymmetric and a symmetric signing key are registered, the symmetric key will always be preferred when protecting access tokens,
> authorization codes or refresh tokens, while the asymmetric key will be used to sign identity tokens, that are meant to be publicly validated.

### Registering a certificate (recommended for production-ready scenarios)

To register a signing or encryption certificate, the `options.AddSigningCertificate()`/`options.AddEncryptionCertificate()` methods can be called
with an instance of `X509Certificate2`. Alternatively, a unique `thumbprint` identifying the certificate in the machine or user certificate store
of the operating system can also be provided.

**In production, it is recommended to use two RSA certificates, distinct from the certificate(s) used for HTTPS: one for encryption, one for signing**.
Certificates can be generated and self-signed locally using the .NET Core `CertificateRequest` API:

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

The best place to store your certificates will depend on your host:
  - For IIS applications, [storing the certificates in the machine store](https://www.sonicwall.com/support/knowledge-base/how-can-i-import-certificates-into-the-ms-windows-local-machine-certificate-store/170504615105398/) is the recommended option.
  - On Azure, certificates can be uploaded and exposed to Azure App Service applications using the special `WEBSITE_LOAD_CERTIFICATES` flag.
For more information, visit [Use a TLS/SSL certificate in your code in Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/configure-ssl-certificate-in-code).

## Importing credentials in the API/resource validation options

### Using the `options.UseLocalServer()` integration

When the API and the authorization server are part of the same project, both the signing and
encryption credentials can be easily imported by calling `options.UseLocalServer()`:

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.UseLocalServer();
    });
```

### Using OpenID Connect discovery (asymmetric signing keys only)

When the API and the authorization server are hosted in different applications,
[standard OpenID Connect discovery](https://openid.net/specs/openid-connect-discovery-1_0.html) can be used to automatically import asymmetric signing keys:

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.SetIssuer("https://localhost:44319/");
        options.UseSystemNetHttp();
    });
```

### Registering a symmetric signing key in the token validation parameters

Unlike asymmetric signing keys, symmetric keys - used with HMAC-based algorithms like [HS256](https://datatracker.ietf.org/doc/html/rfc7518#section-3.2) - cannot
be safely exposed by an OpenID Connect discovery endpoint. As such, they can't be automatically imported by the OpenIddict validation handler.
For applications that require using a symmetric signing key, the advanced configuration APIs can be used to register it in the token validation options:


```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.Configure(options => options.TokenValidationParameters.IssuerSigningKey =
            new SymmetricSecurityKey(
                Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));
    });
```

### Registering an encryption key or certificate

To import an encryption key/certificate, the same overloads as the ones exposed by the OpenIddict server feature can be used:

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.AddEncryptionCertificate("b82f36609cdaff9a95de60e8d5ac774b2e496c4b");
    });
```