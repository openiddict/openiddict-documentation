# Token formats <Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

> [!TIP]
> In OpenIddict 3.0+, the ability to revoke a token is not tied to the token format and doesn't require enabling reference tokens:
> regular JWT or ASP.NET Core Data Protection tokens can be revoked as long as token storage is not explicitly disabled in the server options.
>
>
> For more information about reference tokens, read [Token storage](token-storage.md).

## JSON Web Token

OpenIddict implements the [JSON Web Token](https://tools.ietf.org/html/rfc7519), [JSON Web Signature](https://tools.ietf.org/html/rfc7515)
and [JSON Web Encryption](https://tools.ietf.org/html/rfc7516) standards and relies on the
[Azure Active Directory IdentityModel Extensions for .NET library](https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/)
developed and maintained by Microsoft to generate signed and encrypted tokens using the credentials registered in the server options.

### JWT token types

To protect against token substitution and confused deputy attacks, **OpenIddict 3.0+ uses the standard `typ` JWT header to convey the actual token type**.
This mechanism replaces the private `token_usage` claim used for the same purpose in previous versions of OpenIddict.

As required by the [JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens specification](https://datatracker.ietf.org/doc/html/rfc9068),
**access tokens produced by OpenIddict 3.0 are always issued with a `"typ": "at+jwt"` header** while identity tokens still use `"typ": "JWT"` for backward compatibility.
Other types of tokens – only accepted by OpenIddict's own endpoints – use private token types prefixed by `oi_`.

### Disabling JWT access token encryption

By default, **the OpenIddict server enforces encryption for all the token types it supports**. While this enforcement cannot be disabled for authorization codes,
refresh tokens and device codes for security reasons, it can be relaxed for access tokens when integration with third-party APIs/resource servers is desired.
Access token encryption can also be disabled if the resource servers receiving the access tokens don't fully support JSON Web Encryption.

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.DisableAccessTokenEncryption();
    });
```

## ASP.NET Core Data Protection

Both the OpenIddict client and server features can be configured to use
[ASP.NET Core Data Protection](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/introduction) to create opaque binary
tokens instead of JWT tokens. ASP.NET Core Data Protection uses its own key ring to encrypt and protect tokens against tampering and is
supported for all types of tokens, except identity tokens, that are always JWT tokens.

Unlike JWTs, ASP.NET Core Data Protection tokens only support symmetric encryption and rely on a binary format developed by the
ASP.NET team rather than on a standard like JWT. While this prevents using such tokens in scenarios where interoperability is needed,
opting for ASP.NET Core Data Protection rather than JWT has actually a few advantages:

  - ASP.NET Core Data Protection tokens don't use a JSON representation and therefore are generally a bit shorter.
  - ASP.NET Core Data Protection has been designed to achieve high throughput as it's natively used
  by ASP.NET Core for authentication cookies, antiforgery tokens and session cookies.

> [!WARNING]
> Despite its name, ASP.NET Core Data Protection is not tied to ASP.NET Core and can be used in any .NET Standard 2.0-compatible
> application, including legacy ASP.NET 4.6.1 (and higher) applications using `Microsoft.Owin`.
>
> To enable ASP.NET Core Data Protection support in the OpenIddict OWIN hosts, you need to manually reference the
> `OpenIddict.Client.DataProtection`, `OpenIddict.Server.DataProtection` and `OpenIddict.Validation.DataProtection` packages.

### Switching to Data Protection tokens <Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

ASP.NET Core Data Protection support is provided by the `OpenIddict.Client.DataProtection`, `OpenIddict.Server.DataProtection`
and `OpenIddict.Validation.DataProtection` packages. These packages are referenced by the `OpenIddict.AspNetCore` metapackage
and therefore don't have to be referenced explicitly.

To force the OpenIddict server to use ASP.NET Core Data Protection support, call `options.UseDataProtection()` in **both the server and validation options**
(as APIs will use the same token format to be able to properly extract access tokens):

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.UseDataProtection();
    })
    .AddValidation(options =>
    {
        options.UseDataProtection();
    });
```

You can also configure the OpenIddict client to use ASP.NET Core Data Protection to generate
state tokens, independently of the token format used for the server or validation features:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseDataProtection();
    });
```

> [!NOTE]
> Switching to ASP.NET Core Data Protection tokens doesn't prevent JWT tokens issued before Data Protection support was enabled from being validated:
> existing tokens can still be used alongside newly issued ASP.NET Core Data Protection tokens until they expire. When sending a refresh token request containing
> a JWT refresh token, the application will receive an ASP.NET Core Data Protection refresh token and the previous one will be automatically marked as redeemed.

By default, enabling ASP.NET Core Data Protection support will automatically switch the token format from JWT to Data Protection for all types of tokens
(except identity tokens, that are always JWT tokens by definition).
The OpenIddict/Data Protection integration can be configured to prefer JWT when creating new tokens, **which can be useful when using the ASP.NET Core Data Protection
format for specific token types only** (e.g for authorization codes and refresh tokens, but not for access tokens).

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseDataProtection()
               .PreferDefaultStateTokenFormat();
    })
    .AddServer(options =>
    {
        options.UseDataProtection()
               .PreferDefaultAccessTokenFormat()
               .PreferDefaultAuthorizationCodeFormat()
               .PreferDefaultDeviceCodeFormat()
               .PreferDefaultRefreshTokenFormat()
               .PreferDefaultUserCodeFormat();
    });
```

> [!WARNING]
> When the authorization and API/resource servers are not part of the same application, ASP.NET Core Data Protection MUST be configured to use
> the same application name and share the same key ring to allow the OpenIddict validation handler to read ASP.NET Core Data Protection tokens
> generated by an authorization server located in another project.
>
> For more information, read [Configure ASP.NET Core Data Protection](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/overview).
