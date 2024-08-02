# Token storage <Badge type="info" text="core" /><Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

To keep track of all the tokens produced by its client and server features, OpenIddict creates a token entry in the database for each generated token.
A token entry contains metadata like the subject of the token, the client identifier of the application it was issued to or its creation and expiration dates.

By default, the token payload – generated using either the
[Azure Active Directory IdentityModel Extensions for .NET library](https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/) for JWT tokens or
[ASP.NET Core Data Protection](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/introduction) for Data Protection tokens – is never stored in the database,
except for the following types of tokens:
  - Client feature: state tokens.
  - Server feature: authorization codes, device and user codes (exclusively used in the device code flow).

Such tokens – called reference tokens – are not returned as-is to the caller: instead, their payload is stored in the database entry and a crypto-secure
random 256-bit identifier – called reference identifier – is returned as a base64url-encoded string and serves as the "final" token used by the client application
when communicating with OpenIddict's endpoints or with resource servers (if reference access tokens are enabled in the server options).

> [!TIP]
> In OpenIddict 3.0+, the ability to revoke a token is not tied to the token format and doesn't require enabling reference tokens:
> regular JWT or ASP.NET Core Data Protection tokens can be revoked as long as token storage is not explicitly disabled in the server options.

## Enabling reference access and/or refresh tokens <Badge type="danger" text="server" />

Reference access and refresh tokens can be manually enabled in the server options for developers who prefer returning
shorter access and/or refresh tokens or need to deal with limits that would prevent sending large tokens over the wire.

> [!CAUTION]
> When enabling reference access and/or refresh tokens support, it is STRONGLY recommended to either:
> - Use the ASP.NET Core Data Protection format for access and refresh tokens, as they benefit from additional security measures that would prevent them from being sent as-is if
> they were stolen from the database. For more information on how to enable ASP.NET Core Data Protection, read [Token formats](token-formats.md).
> - Enable column encryption/data at rest encryption to protect the `Payload` column of token entries.

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.UseReferenceAccessTokens()
               .UseReferenceRefreshTokens();
    });
```

## Enabling token entry validation at the API level <Badge type="tip" text="validation" />

**For performance reasons, OpenIddict doesn't check, by default, the status of a token entry when receiving an API request**: access tokens are considered valid until they expire.
For scenarios that require immediate access token revocation, the OpenIddict validation handler can be configured to enforce token entry validation for each API request:

> [!NOTE]
> Enabling token entry validation requires that the OpenIddict validation handler have a direct access to the server database where tokens are stored, which makes it
> better suited for APIs located in the same application as the authorization server. For external applications, consider using introspection instead of local validation.
>
> In both cases, additional latency – caused by the additional DB request and the HTTP call for introspection – is expected.

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.EnableTokenEntryValidation();
    });
```

## Disabling token storage <Badge type="danger" text="server" />

While STRONGLY discouraged, token storage can be disabled in the server options:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.DisableTokenStorage();
    });
```

> [!WARNING]
> Disabling token storage prevents reference access or refresh tokens support from being enabled, as this requires storing the tokens in the database.
