# Pushed Authorization Requests <Badge type="warning" text="client" /><Badge type="danger" text="server" />

OAuth 2.0 Pushed Authorization Requests (aka PAR) is a [specification](https://datatracker.ietf.org/doc/html/rfc9126) that was designed
to offer integrity-protected authorization requests to confidential clients: by sending the actual request parameters via backchannel
communication before redirecting the user agent to the regular authorization endpoint with a unique and random `request_uri` attached,
authorization flows can only be initiated by the legit client and the content of authorization requests cannot be altered on-the-fly
by the end user or a malicious party.

While the protection offered by this mechanism mostly benefits to confidential applications,
public clients (e.g browser applications, mobile or desktop applications) can also use it.

Pushed Authorization Requests are fully supported by the OpenIddict client and server stacks in OpenIddict 6.1.0 and higher.

> [!TIP]
> The OpenIddict client always uses Pushed Authorization Requests when the configuration metadata indicates this feature
> is supported by the authorization server: you don't have to configure anything to enable it at the client level.

## Enabling the pushed authorization endpoint <Badge type="danger" text="server" />

Like all the server endpoints (except the configuration and JSON Web Key Set endpoints), the pushed authorization endpoint
is opt-in and must be explicitly enabled before a client application can start sending pushed authorization requests:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.SetPushedAuthorizationEndpointUris("connect/par");
    });
```

## Allowing client applications to use the pushed authorization endpoint <Badge type="danger" text="server" />

Unless endpoint permissions are explicitly disabled using the `options.IgnoreEndpointPermissions()` API, a client application
must be explicitly granted the pushed authorization endpoint permission to be able to communicate with this endpoint:

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
        Permissions.Endpoints.EndSession,
        Permissions.Endpoints.PushedAuthorization,
        Permissions.Endpoints.Token,
        Permissions.GrantTypes.AuthorizationCode,
        Permissions.GrantTypes.RefreshToken,
        Permissions.ResponseTypes.Code,
        Permissions.Scopes.Email,
        Permissions.Scopes.Profile,
        Permissions.Scopes.Roles,
        Permissions.Prefixes.Scope + "demo_api"
    }
});
```

> [!TIP]
> For more information about permissions, read [Application permissions](application-permissions.md).

## Enabling PAR enforcement at the global level <Badge type="danger" text="server" />

Pushed Authorization Requests can be enforced globally by calling `options.RequirePushedAuthorizationRequests()` in the server options:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.RequirePushedAuthorizationRequests();
    });
```

## Enabling PAR enforcement per client <Badge type="danger" text="server" />

Pushed Authorization Requests can also be enforced per-client by adding it to the list of requirements attached to a client:

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
        Permissions.Endpoints.EndSession,
        Permissions.Endpoints.PushedAuthorization,
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
        Requirements.Features.PushedAuthorizationRequests
    }
});
```

## Disabling PAR support for a specific client registration or web provider <Badge type="warning" text="client" />

While it recommended that all clients (public or confidential) use OAuth 2.0 Pushed Authorization Requests
when available, the feature can be explicitly disabled in the client registration or using the web providers APIs:

### Disabling PAR using `OpenIddictClientRegistration.DisablePushedAuthorizationRequests`

```csharp
options.AddRegistration(new OpenIddictClientRegistration
{
    Issuer = new Uri("https://localhost:44395/", UriKind.Absolute),
    ProviderName = "Local",
    ProviderDisplayName = "Local authorization server",

    ClientId = "console",

    PostLogoutRedirectUri = new Uri("callback/logout/local", UriKind.Relative),
    RedirectUri = new Uri("callback/login/local", UriKind.Relative),

    Scopes = { Scopes.Email, Scopes.Profile, Scopes.OfflineAccess, "demo_api" },

    DisablePushedAuthorizationRequests = true
});
```

### Disabling PAR using `options.DisablePushedAuthorizationRequests()`

```csharp
options.UseWebProviders()
       .AddKeycloak(options =>
       {
           options.SetIssuer("https://fabrikam.com/realms/master")
                  .SetClientId("fabrikam")
                  .SetClientSecret("gPY5YXUCi3RMB114q3ORM5lA2j6ZWsRu")
                  .SetRedirectUri("callback/login/keycloak")
                  .SetPostLogoutRedirectUri("callback/logout/keycloak")
                  .DisablePushedAuthorizationRequests();
       });
```
