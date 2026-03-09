# Assertion-based client authentication <Badge type="warning" text="client" /><Badge type="info" text="core" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

As an alternative to client secrets, OpenIddict supports the standard `private_key_jwt` method defined in the
[RFC7523](https://datatracker.ietf.org/doc/html/rfc7523) and [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html#ClientAuthentication)
specifications. While it offers a slightly lower level of security compared to Mutual TLS authentication, it is an order of magnitude
easier to set up as it doesn't require making any change to the web server or the intermediate load balancer/reverse proxies.

Since it is more secure than traditional client secrets and now benefits from a broad
support in client libraries, it is the recommended option for most scenarios.

> [!TIP]
> Ideally, client secrets should only be used for backwards compatibility.

## Enabling assertion-based authentication support in the server options <Badge type="danger" text="server" />

Unlike mTLS, the standard `private_key_jwt` client authentication method is always enabled
by default in the server stack and doesn't require any specific configuration.

## Attaching public keys to the JSON Web Key Set of the client application <Badge type="info" text="core" />

While client secrets must be known by both the client and the server, client assertions rely on public-key cryptography, which significantly
improves security as the server only needs to know the public part of the public/private keys pair to be able to validate an assertion.

> [!WARNING]
> When the client application and the authorization server belong to two different organizations, it is strongly recommended to let the
> organization owning the client application to generate the public/private keys pair and only communicate the public key to the organization
> that operates the authorization server. This way, the private key - needed to generate the assertions - will exclusively be known by the client.

While OpenIddict supports both raw asymmetric keys and keys embedded in X.509 certificates, raw RSA or ECDSA keys are generally a bit
easier to use. To generate an ECDSA private/public key pair using the NIST P-256 curve, you can directly use the `ECDsa.Create()` API:

```csharp
using var algorithm = ECDsa.Create(ECCurve.NamedCurves.nistP256);
```

> [!TIP]
> Once generated, the public part can exported to the standard PEM format using `ExportSubjectPublicKeyInfoPem()` and
> the private key can be exported using `ExportECPrivateKeyPem()`.

Then, the signing key must be attached to the `JsonWebKeySet` of the client application via `IOpenIddictApplicationManager`:

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
            // Instead of sending a client secret, this application authenticates by
            // generating client assertions that are signed using an ECDSA signing key.
            //
            // Note: while the client needs access to the private key, the server only needs
            // to know the public key to be able to validate the client assertions it receives.
            JsonWebKeyConverter.ConvertFromECDsaSecurityKey(GetECDsaSigningKey(
                key: "[PEM-encoded key exported via ExportSubjectPublicKeyInfoPem()]"))
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

```csharp
static ECDsaSecurityKey GetECDsaSigningKey(ReadOnlySpan<char> key)
{
    var algorithm = ECDsa.Create();
    algorithm.ImportFromPem(key);

    return new ECDsaSecurityKey(algorithm);
}
```

> [!TIP]
> If a client application is assigned both a JSON Web Key Set containing at least one public key and a client secret, it will be
> able to use both methods to authenticate. This implementation detail can be leveraged to implement a smooth migration strategy for
> existing clients: once migrated to the safer `private_key_jwt` method, the client secret can be removed from the application entry.

## Using assertion-based authentication in the client stack <Badge type="warning" text="client" />

Using assertion-based authentication doesn't require any specific configuration when using the OpenIddict client stack
and, exactly like mTLS-based client authentication, only requires attaching the private key to the signing credentials
of the client registration for which client assertions should be transparently generated.

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

            SigningCredentials =
            {
                // Note: in a real world application, the private key MUST NOT be hardcoded
                // and SHOULD instead be stored in a safe place (e.g in a key vault).
                new SigningCredentials(GetECDsaSigningKey(
                    key: "[PEM-encoded key exported via ExportECPrivateKeyPem()]"),
                    SecurityAlgorithms.EcdsaSha256, SecurityAlgorithms.Sha256)
            }
        });
    });
```

```csharp
static ECDsaSecurityKey GetECDsaSigningKey(ReadOnlySpan<char> key)
{
    var algorithm = ECDsa.Create();
    algorithm.ImportFromPem(key);

    return new ECDsaSecurityKey(algorithm);
}
```

## Using assertion-based authentication in the validation stack with OAuth 2.0 introspection <Badge type="tip" text="validation" />

When using OAuth 2.0 introspection, resource servers typically receive a client identifier and are expected to
authenticate when communicating with the introspection endpoint. Just like any other client application,
a resource server/API using the validation stack can be configured to use client assertions to authenticate:

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        // ...

        // Note: in a real world application, the private key MUST NOT be hardcoded
        // and SHOULD instead be stored in a safe place (e.g in a key vault).
        options.AddSigningKey(GetECDsaSigningKey(
            key: "[PEM-encoded key exported via ExportECPrivateKeyPem()]"));
    });
```
