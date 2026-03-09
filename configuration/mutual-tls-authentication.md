# Mutual TLS authentication <Badge type="warning" text="client" /><Badge type="info" text="core" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

For scenarios that require the highest level of security, OpenIddict supports [mutual TLS](https://www.rfc-editor.org/rfc/rfc8705.html)
for both OAuth 2.0 client authentication and token binding. While it is more complicated to configure than the standard `private_key_jwt`
client authentication method and has specific restrictions (e.g a static issuer MUST be configured in the OpenIddict server options),
mTLS provides a higher level of security and can also be used by public clients to bind access and refresh tokens to a specific
certificate (making them much harder to steal).

The two authentication methods defined in [RFC8705](https://www.rfc-editor.org/rfc/rfc8705.html#name-mutual-tls-for-oauth-client)
are supported by the OpenIddict client, server and validation stacks:
  - **TLS client authentication based on self-signed X.509 certificates**: it is the simplest option as it only requires attaching the certificate
  (without the private key) to the client application in the database. **It is the recommended method for most scenarios**.
  - **TLS client authentication relying on a [Public Key Infrastructure](https://en.wikipedia.org/wiki/Public_key_infrastructure)**:
  while it is more complicated to set up than the previous method and generally requires maintaining your own internal Public Key Infrastructure,
  it enables advanced scenarios that can't be easily supported with self-signed certificates (e.g authentication of IoT devices provisioned
  in factories with a unique certificate issued by a custom PKI). **This method should only be used by users who have a solid PKI experience**.

## Enabling TLS client authentication support in the server options <Badge type="danger" text="server" />

> [!NOTE]
> TLS client authentication is not officially supported by the server stack on .NET Framework due to the lack of custom trust stores support.
> While it is possible to work around this limitation, doing so is NOT recommended and should only be done by advanced OpenIddict users.

### Enabling the self-signed and PKI-based methods

While enabling self-signed certificates support doesn't require any particular configuration, PKI-based authentication requires
registering the root certificate authority and all the intermediate certificate authorities (if applicable) in the server options:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        // ...

        options.EnableSelfSignedTlsClientAuthentication();
    });
```

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        // ...

        options.EnablePublicKeyInfrastructureTlsClientAuthentication(
        [
            X509Certificate2.CreateFromPem("[PEM-encoded root certificate]"),

            // Required, if intermediate certificate authorities are used:
            X509Certificate2.CreateFromPem("[PEM-encoded intermediate certificate 1]"),
            X509Certificate2.CreateFromPem("[PEM-encoded intermediate certificate 2]")
        ]);
    });
```

### Registering the mTLS-specific endpoint aliases

While not strictly required, configuring mTLS-specific endpoint aliases is **strongly recommended** to ensure the user experience
of users authenticating via web browsers will not be severely degraded: TLS client authentication can indeed only be enforced
globally and not per-client or per-address, which results in certificate selection prompts being systematically displayed by
browsers if they call HTTPS servers for which TLS client authentication is enforced.

Using endpoint aliases with mTLS-specific domains completely avoids this issue:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        // ...

        // Configure the mTLS endpoint aliases that will be used by client applications opting
        // for TLS-based client authentication to communicate with the authorization server:
        // the configured URIs MUST point to a domain for which the HTTPS server is configured
        // to require the use of client certificates when receiving TLS handshakes from clients.
        options.SetMtlsDeviceAuthorizationEndpointAliasUri("https://mtls.dev.localhost:44395/connect/device")
               .SetMtlsIntrospectionEndpointAliasUri("https://mtls.dev.localhost:44395/connect/introspect")
               .SetMtlsPushedAuthorizationEndpointAliasUri("https://mtls.dev.localhost:44395/connect/par")
               .SetMtlsRevocationEndpointAliasUri("https://mtls.dev.localhost:44395/connect/revoke")
               .SetMtlsTokenEndpointAliasUri("https://mtls.dev.localhost:44395/connect/token")
               .SetMtlsUserInfoEndpointAliasUri("https://mtls.dev.localhost:44395/connect/userinfo");
    });
```

### Configuring a static issuer

Setting a static issuer is mandatory when using mTLS aliases to ensure it not dynamically computed based on the request URI,
as this would result in two different issuers being used (one pointing to the mTLS domain and one pointing to the regular one).

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        // ...

        options.SetIssuer("https://localhost:44395/");
    });
```

### Enabling access tokens and refresh tokens binding (optional)

Optionally, the OpenIddict server stack can be configured to issue certificate-bound access tokens. When enabling this feature, the standard
`cnf` claim is automatically added to access tokens and OAuth 2.0 introspection responses to inform resource servers that a proof of
possession based on the TLS certificate must be provided by the client applications.

> [!NOTE]
> When receiving a certificate-bound access token, the OpenIddict validation stack will automatically reject the authentication
> demand if the client certificate used when the access token was issued is not used when making the API call.

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        // ...

        options.UseClientCertificateBoundAccessTokens();
    });
```

Similarly, refresh tokens issued to public client applications can also be certificate-bound: in this case, the refresh tokens
issued to public clients sending a TLS client certificate are automatically bound to the certificate used when they were acquired,
which requires sending the same certificate when using them to get new access tokens.

> [!TIP]
> Refresh tokens issued to confidential client applications don't need this additional layer of protection as they are already
> sender-constrained via traditional OAuth 2.0 client authentication: only a client application presenting valid credentials
> (e.g client certificate, client secret or client assertion) and listed as an authorized presenter can use the refresh token.

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        // ...

        options.UseClientCertificateBoundRefreshTokens();
    });
```

### Configuring the host to require TLS client authentication for the mTLS domain

How the host is configured is entirely specific to the host implementation.

> [!NOTE]
> Enabling mTLS support in the OpenIddict server stack doesn't require adding or using the ASP.NET Core certificate
> authentication handler: OpenIddict uses its own logic to extract the `X509Certificate2` object from the ASP.NET Core
> request and validate it using `OpenIddictApplicationManager`.

When using Kestrel, the `TlsHandshakeCallbackOptions.OnConnection` hook can be used to dynamically determine whether
a client application will be asked to provide a client certificate. This process is typically done based on
the server name indication (SNI) provided by the TLS client when starting the handshake:

```csharp
// Configure Kestrel to listen on the 44395 port and configure it to enforce mTLS.
//
// Note: depending on the operating system, the mtls.dev.localhost
// subdomain MAY have to be manually mapped to 127.0.0.1 or ::1.
services.Configure<KestrelServerOptions>(options => options.ListenAnyIP(44395, options =>
{
    options.UseHttps(new TlsHandshakeCallbackOptions
    {
        OnConnection = GetServerAuthenticationOptionsAsync
    });
}));

static ValueTask<SslServerAuthenticationOptions> GetServerAuthenticationOptionsAsync(TlsHandshakeCallbackContext context)
{
    using var store = new X509Store(StoreName.My, StoreLocation.CurrentUser);
    store.Open(OpenFlags.ReadOnly);

    return ValueTask.FromResult(new SslServerAuthenticationOptions
    {
        // Require a client certificate for all the requests pointing to the mTLS subdomain.
        ClientCertificateRequired = string.Equals(context.ClientHelloInfo.ServerName,
            "mtls.dev.localhost", StringComparison.OrdinalIgnoreCase),

        // Ignore all the client certificate errors for requests pointing to
        // the mTLS-specific domain, even if they indicate that the chain is
        // invalid: this is necessary to allow OpenIddict to validate the PKI
        // and self-signed certificates using its own per-client chain policies.
        RemoteCertificateValidationCallback = (sender, certificate, chain, errors) =>
        {
            if (string.Equals(context.ClientHelloInfo.ServerName,
                "mtls.dev.localhost", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            return errors is SslPolicyErrors.None or SslPolicyErrors.RemoteCertificateNotAvailable;
        },

        // Use the development certificate generated and stored by ASP.NET Core in the user store.
        ServerCertificate = store.Certificates
            .Find(X509FindType.FindByExtension, "1.3.6.1.4.1.311.84.1.1", validOnly: false)
            .Cast<X509Certificate2>()
            .Where(static certificate => certificate.NotBefore < TimeProvider.System.GetLocalNow())
            .Where(static certificate => certificate.NotAfter > TimeProvider.System.GetLocalNow())
            .OrderByDescending(static certificate => certificate.NotAfter)
            .FirstOrDefault() ??
            throw new InvalidOperationException("The ASP.NET Core HTTPS development certificate was not found.")
    });
}
```

> [!CAUTION]
> Depending on your environment (e.g when doing TLS termination at the load-balancer level), you may need to forward client certificates
> between the different servers involved in the request handling. To help with that, the ASP.NET Core certificate forwarding middleware
> can be used but extreme caution is advised when using it as that middleware doesn't validate the origin of the header containing the certificate:
> an invalid configuration may result in the ability for malicious clients to authenticate without needing the private key of the certificate.
>
> For more informationn, read [Use certificate authentication in custom web proxies](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/certauth?use-certificate-authentication-in-custom-web-proxies).

## Attaching self-signed certificates to the JSON Web Key Set of the client application (self-signed-only) <Badge type="info" text="core" />

When using the self-signed method, one or more certificate(s) - without the private keys - must be attached
to each client application that will use the `self_signed_tls_client_auth` method to authenticate.

Generating X.509 certificates suitable for TLS client authentication can easily be done using the `CertificateRequest` API provided by the BCL in modern versions of .NET:

```csharp
using var algorithm = RSA.Create(keySizeInBits: 4096);

// Note: OpenIddict requires that certificates explicitly contain the
// "digitalSignature" key usage and the "clientAuth" extended key usage.
var subject = new X500DistinguishedName("CN=Fabrikam authentication certificate");
var request = new CertificateRequest(subject, algorithm, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
request.CertificateExtensions.Add(new X509KeyUsageExtension(X509KeyUsageFlags.DigitalSignature, critical: true));
request.CertificateExtensions.Add(new X509EnhancedKeyUsageExtension([new Oid("1.3.6.1.5.5.7.3.2")], critical: true));

var certificate = request.CreateSelfSigned(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddYears(10));
```

> [!TIP]
> The certificate and its private key can be exported to the standard PEM format using the dedicated `ExportCertificatePem()` and `ExportRSAPrivateKeyPem()` APIs.

Once generated, the certificate must be attached to the `JsonWebKeySet` of the client application via `IOpenIddictApplicationManager`:

```csharp
var descriptor = new OpenIddictApplicationDescriptor
{
    ApplicationType = ApplicationTypes.Web,
    ClientId = "mvc",
    ClientType = ClientTypes.Confidential,
    DisplayName = "MVC client application",
    JsonWebKeySet = new JsonWebKeySet
    {
        Keys =
        {
            // This application authenticates by using a self-signed client authentication
            // certificate during the TLS handshake. While the client needs access to the
            // private key, the server only needs to know the public part - included by the
            // ExportCertificatePem() API - to be able to validate the certificates it receives.
            JsonWebKeyConverter.ConvertFromX509SecurityKey(new X509SecurityKey(
                X509Certificate2.CreateFromPem("[PEM-encoded certificate exported via ExportCertificatePem()]")))
        }
    },
    RedirectUris =
    {
        new Uri("https://localhost:44381/callback/login/local")
    },
    PostLogoutRedirectUris =
    {
        new Uri("https://localhost:44381/callback/logout/local")
    },
    Permissions =
    {
        Permissions.Endpoints.Authorization,
        Permissions.Endpoints.EndSession,
        Permissions.Endpoints.PushedAuthorization,
        Permissions.Endpoints.Token,
        Permissions.GrantTypes.AuthorizationCode,
        Permissions.GrantTypes.RefreshToken,
        Permissions.ResponseTypes.Code,
        Permissions.Scopes.Email,
        Permissions.Scopes.Profile,
        Permissions.Scopes.Roles
    },
    Requirements =
    {
        Requirements.Features.ProofKeyForCodeExchange,
        Requirements.Features.PushedAuthorizationRequests
    }
};

await manager.CreateAsync(descriptor);
```

## Attaching subordinate CA certificates to the JSON Web Key Set of the client application (PKI-only) <Badge type="info" text="core" />

To support advanced scenarios where the organization owning a specific client application is allowed to issue its own certificates,
OpenIddict allows attaching intermediate PKI certificates to the JSON Web Key Set of the client application, exactly like in the
previous section. In this case, OpenIddict enforces specific requirements:
  - The certificate must include the "certificate authority" basic constraint.
  - The certificate must include the `keyCertSign` key usage.
  - The certificate must not be self-issued.

> [!WARNING]
> End certificates (that are the ones used by the client applications to authenticate) do not need to/shouldn't be added to the
> JSON Web Key Set. **Unlike self-signed certificates, PKI end certificates must explicitly include one of the domains used
> in `redirect_uri`s in either the `Common Name` or `Subject Alternative Name` extension**. This additional requirement helps
> mitigate mix-up attacks and is always enforced by default.

## Using TLS client authentication in the client stack <Badge type="warning" text="client" />

### Using mTLS for OAuth 2.0 client authentication (confidential clients-only)

Using TLS client authentication for OAuth 2.0 client authentication doesn't require any specific configuration when using
the OpenIddict client stack and, exactly like assertion-based client authentication, only requires attaching the client
certificate to the signing credentials of the client registration for which mTLS should be used.

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        // ...

        options.AddRegistration(new OpenIddictClientRegistration
        {
            Issuer = new Uri("https://localhost:44395/", UriKind.Absolute),
            ProviderName = "Local",
            ProviderDisplayName = "Local OIDC server",

            ClientId = "mvc",
            Scopes = { Scopes.Email, Scopes.Profile, Scopes.OfflineAccess, "demo_api" },

            RedirectUri = new Uri("callback/login/local", UriKind.Relative),
            PostLogoutRedirectUri = new Uri("callback/logout/local", UriKind.Relative),

            SigningCredentials = { GetCertificateCredentials() }
        });
    });
```

```csharp
static X509SigningCredentials GetCertificateCredentials()
{
    // Note: in a real world application, the certificate and its private key
    // MUST NOT be hardcoded and SHOULD instead be stored in the X.509 certificate
    // store of the machine or user running the web server process, similarly to
    // the signing and encryption keys used by the server stack to protect tokens.
    var certificate = X509Certificate2.CreateFromPem(
        certPem: "[PEM-encoded certificate exported via ExportCertificatePem()]",
        keyPem: "[PEM-encoded private key exported via ExportRSAPrivateKeyPem()]");

    // On Windows, a certificate loaded from PEM-encoded material is ephemeral and
    // cannot be directly used with TLS, as Schannel cannot access it in this case.
    //
    // To work this limitation, the certificate is exported and re-imported from a
    // PFX blob to ensure the private key is persisted in a way that Schannel can use.
    //
    // In a real world application, the certificate wouldn't be embedded in the source code
    // and would be installed in the certificate store, making this workaround unnecessary.
    if (OperatingSystem.IsWindows())
    {
        certificate = X509CertificateLoader.LoadPkcs12(
            data: certificate.Export(X509ContentType.Pfx, string.Empty),
            password: string.Empty,
            keyStorageFlags: X509KeyStorageFlags.DefaultKeySet);
    }

    return new X509SigningCredentials(certificate);
}
```

> [!NOTE]
> OpenIddict requires that certificates used for TLS client authentication explicitly
> contain the "digitalSignature" key usage and the "clientAuth" extended key usage.

### Using mTLS for token binding (public clients-only)

While desktop/mobile applications are generally public clients (and thus cannot use mTLS for client authentication), it is
possible for public clients that require a high level of security to use mTLS purely for token binding. When using the OpenIddict
client and its `OpenIddictClientService`, the new `TokenBindingCertificate` property added to the `InteractiveAuthenticationRequest`,
`CustomGrantAuthenticationRequest`, `DeviceAuthenticationRequest`, `PasswordAuthenticationRequest`, `TokenExchangeAuthenticationRequest`
and `RefreshTokenAuthenticationRequest` models can be used to select a TLS client authentication certificate (that will typically
be generated on-the-fly and stored in the user store in practice):

```csharp
var result = await _service.ChallengeInteractivelyAsync(new()
{
    CancellationToken = cancellationToken,
    ProviderName = "Local"
});

AnsiConsole.MarkupLine("[cyan]Waiting for the user to approve the authorization demand.[/]");

var response = await _service.AuthenticateInteractivelyAsync(new()
{
    CancellationToken = cancellationToken,
    Nonce = result.Nonce,
    TokenBindingCertificate = certificate
});
```

## Using TLS client authentication in the validation stack with OAuth 2.0 introspection <Badge type="tip" text="validation" />

When using OAuth 2.0 introspection, resource servers typically receive a client identifier and are expected to
authenticate when communicating with the introspection endpoint. Just like any other client application,
a resource server/API using the validation stack can be configured to use mTLS to authenticate:

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        // ...

        // Note: in a real world application, the certificate and its private key
        // MUST NOT be hardcoded and SHOULD instead be stored in the X.509 certificate
        // store of the machine or user running the web server process, similarly to
        // the signing and encryption keys used by the server stack to protect tokens.
        options.AddSigningCertificate(X509Certificate2.CreateFromPem(
            certPem: "[PEM-encoded certificate exported via ExportCertificatePem()]",
            keyPem: "[PEM-encoded private key exported via ExportRSAPrivateKeyPem()]"));
    });
```

> [!TIP]
> No specific configuration is required to validate the `cnf` claim of the tokens received by the validation stack,
> as it's always enforced automatically, independently of the validation mode (local or introspection):
> authentication operations that do not include the correct TLS client authentication certificate matching
> the SHA256 thumbprint stored in the `cnf` claim will be automatically rejected by OpenIddict.
