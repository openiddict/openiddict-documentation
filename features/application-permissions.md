# Application permissions

Starting with RC2, OpenIddict includes an optional feature codenamed "app permissions" that allows
controlling and limiting the OAuth2/OpenID Connect features a client application is able to use.

3 categories of permissions are currently supported:
  - Endpoint permissions
  - Grant type/flow permissions
  - Scope permissions.

> Configuring application permissions is recommended when dealing with
third-party clients, to ensure they can only use the features they need. 

## Endpoint permissions

### Definition

Endpoint permissions limit the endpoints a client application can use.

> If no endpoint permission is explicitly granted, the client application
is allowed to use all the endpoints enabled in `Startup.ConfigureServices()`.

### Supported permissions

|           Endpoint          |                          Constant                         |
|:---------------------------:|:---------------------------------------------------------:|
| Authorization endpoint      | `OpenIddictConstants.Permissions.Endpoints.Authorization` |
| Introspection endpoint      | `OpenIddictConstants.Permissions.Endpoints.Introspection` |
| Logout/end session endpoint | `OpenIddictConstants.Permissions.Endpoints.Logout`        |
| Revocation endpoint         | `OpenIddictConstants.Permissions.Endpoints.Revocation`    |
| Token endpoint              | `OpenIddictConstants.Permissions.Endpoints.Token`         |

### Example

In the following example, the `mvc` application is allowed to use the authorization, logout and
token endpoints but will get an error when trying to send an introspection or revocation request:

```csharp
if (await manager.FindByClientIdAsync("mvc") == null)
{
    await manager.CreateAsync(new OpenIddictApplicationDescriptor
    {
        ClientId = "mvc",
        ClientSecret = "901564A5-E7FE-42CB-B10D-61EF6A8F3654",
        DisplayName = "MVC client application",
        PostLogoutRedirectUris = { new Uri("http://localhost:53507/signout-callback-oidc") },
        RedirectUris = { new Uri("http://localhost:53507/signin-oidc") },
        Permissions =
        {
            OpenIddictConstants.Permissions.Endpoints.Authorization,
            OpenIddictConstants.Permissions.Endpoints.Logout,
            OpenIddictConstants.Permissions.Endpoints.Token
        }
    });
}
```

## Grant type permissions

### Definition

Grant type permissions limit the flows a client application is allowed to use.

> If no grant type permission is explictly attached to an application, all the flows enabled in `Startup.ConfigureServices()`
can be freely used by the application (as long as the authorization or token endpoint permissions are granted).

### Supported permissions

|        Grant type       |                            Constant                            |
|:-----------------------:|:--------------------------------------------------------------:|
| Authorization code flow | `OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode` |
| Client credentials flow | `OpenIddictConstants.Permissions.GrantTypes.ClientCredentials` |
| Implicit flow           | `OpenIddictConstants.Permissions.GrantTypes.Implicit`          |
| Password flow           | `OpenIddictConstants.Permissions.GrantTypes.Password`          |
| Refresh token flow      | `OpenIddictConstants.Permissions.GrantTypes.RefreshToken`      |

To add a custom flow permission, you can use the following pattern:
```csharp
OpenIddictConstants.Permissions.Prefixes.GrantType + "custom_flow_name"
```

### Example

In the following example, the `postman` application can only use the authorization code flow
while `console` is restricted to the `password` and `refresh_token` flows:

```csharp
if (await manager.FindByClientIdAsync("postman") == null)
{
    await manager.CreateAsync(new OpenIddictApplicationDescriptor
    {
        ClientId = "postman",
        DisplayName = "Postman",
        RedirectUris = { new Uri("https://www.getpostman.com/oauth2/callback") },
        Permissions =
        {
            OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode
        }
    });
}

if (await manager.FindByClientIdAsync("console") == null)
{
    await manager.CreateAsync(new OpenIddictApplicationDescriptor
    {
        ClientId = "console",
        DisplayName = "Console",
        Permissions =
        {
            OpenIddictConstants.Permissions.GrantTypes.Password,
            OpenIddictConstants.Permissions.GrantTypes.RefreshToken
        }
    });
}
```

## Scope permissions

### Definition

Scope permissions limit the scopes (standard or custom) a client application is allowed to use.

> Like the other permissions, **scope permissions are optional**: if no scope permission is explictly attached,
a client application is free to specify any scope in the authorization or token requests.

> The `openid` and `offline_access` scopes are special-cased by OpenIddict and don't require explicit permissions.

### Example

In the following sample, the `angular` client is allowed to request the `address`,
`profile` and `custom` scopes: any other scope will result in an error being returned.

```csharp
if (await manager.FindByClientIdAsync("angular") == null)
{
    await manager.CreateAsync(new OpenIddictApplicationDescriptor
    {
        ClientId = "angular",
        DisplayName = "Angular",
        RedirectUris = { new Uri("https://localhost:34422/callback") },
        Permissions =
        {
            OpenIddictConstants.Permissions.Prefixes.Scope +
                OpenIdConnectConstants.Scopes.Address,

            OpenIddictConstants.Permissions.Prefixes.Scope +
                OpenIdConnectConstants.Scopes.Profile,

            OpenIddictConstants.Permissions.Prefixes.Scope + "custom"
        }
    });
}
```