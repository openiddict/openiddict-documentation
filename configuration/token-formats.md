# Token formats <Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

> [!TIP]
> In OpenIddict 3.0+, the ability to revoke a token is not tied to the token format and doesn't require enabling reference tokens:
> regular JWT or ASP.NET Core Data Protection tokens can be revoked as long as token storage is not explicitly disabled in the server options.
>
> For more information about reference tokens, read [Token storage](token-storage.md).

## JSON Web Token

OpenIddict implements the [JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519), [JSON Web Signature](https://datatracker.ietf.org/doc/html/rfc7515)
and [JSON Web Encryption](https://datatracker.ietf.org/doc/html/rfc7516) standards and relies on the
[Azure Active Directory IdentityModel Extensions for .NET library](https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/)
developed and maintained by Microsoft to generate signed and encrypted tokens using the credentials registered in the server options.

### JWT token types

To protect against token substitution and confused deputy attacks, **OpenIddict 3.0+ uses the standard `typ` JWT header to convey the actual token type**.
This mechanism replaces the private `token_usage` claim used for the same purpose in previous versions of OpenIddict.

As required by the [JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens specification](https://datatracker.ietf.org/doc/html/rfc9068),
**access tokens produced by OpenIddict 3.0+ are always issued with a `"typ": "at+jwt"` header** while identity tokens still use `"typ": "JWT"` for backward compatibility.
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

While OpenIddict uses the [JSON Web Token](https://datatracker.ietf.org/doc/html/rfc7519) format for all its tokens, it can be optionally
configured to use [ASP.NET Core Data Protection](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/introduction)
to create opaque binary tokens instead of JWT tokens. For more information on how to use ASP.NET Core Data Protection, read
[ASP.NET Core Data Protection integration](/integrations/aspnet-core-data-protection.md).
