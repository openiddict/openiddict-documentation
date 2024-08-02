# Proof Key for Code Exchange <Badge type="warning" text="client" /><Badge type="danger" text="server" />

Initially designed as a way to protect mobile applications from seeing their callback URIs hijacked by a malicious application installed
on the same device, the [Proof Key for Code Exchange (PKCE)](https://tools.ietf.org/html/rfc7636) mechanism has been extended to
confidential clients to help mitigate authorization code leakages.

Proof Key for Code Exchange is fully supported by all versions of the OpenIddict client and server stacks
and the OpenIddict server can be configured to enforce this security feature globally or per-client.

> [!TIP]
> The OpenIddict client always uses Proof Key for Code Exchange when the configuration metadata indicates this feature
> is supported by the authorization server: you don't have to configure anything to enable it at the client level.

## Enabling PKCE enforcement at the global level <Badge type="danger" text="server" />

Proof Key for Code Exchange can be enforced globally by calling `options.RequireProofKeyForCodeExchange()` in the server options:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.RequireProofKeyForCodeExchange();
    });
```

## Enabling PKCE enforcement per client <Badge type="danger" text="server" />

Proof Key for Code Exchange can also be enforced per-client by adding it to the list of requirements attached to a client:

```csharp
await manager.CreateAsync(new OpenIddictApplicationDescriptor
{
    ClientId = "mvc",
    ClientSecret = "901564A5-E7FE-42CB-B10D-61EF6A8F3654",
    ConsentType = ConsentTypes.Explicit,
    PostLogoutRedirectUris =
    {
        new Uri("https://localhost:44381/signout-callback-oidc")
    },
    RedirectUris =
    {
        new Uri("https://localhost:44381/signin-oidc")
    },
    Permissions =
    {
        Permissions.Endpoints.Authorization,
        Permissions.Endpoints.Logout,
        Permissions.Endpoints.Token,
        Permissions.GrantTypes.AuthorizationCode,
        Permissions.GrantTypes.RefreshToken,
        Permissions.ResponseTypes.Code,
        Permissions.Scopes.Email,
        Permissions.Scopes.Profile,
        Permissions.Scopes.Roles,
        Permissions.Prefixes.Scope + "demo_api"
    },
    Requirements =
    {
        Requirements.Features.ProofKeyForCodeExchange
    }
});
```
