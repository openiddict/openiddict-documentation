# Application permissions

Starting with RC2, OpenIddict includes a built-in feature codenamed "application permissions" that
**allows controlling and limiting the OAuth2/OpenID Connect features a client application is able to use**.

3 categories of permissions are currently supported:
  - Endpoint permissions
  - Grant type/flow permissions
  - Scope permissions.

> [!WARNING]
> Note: **prior to OpenIddict RC3, application permissions were mostly optional** and OpenIddict had a fallback mechanism
> called "implicit permissions" it used to determine whether an application could perform the requested action.
>
> If no permission was explicitly attached to the application, it was considered fully trusted and was granted all the permissions.
> Similarly, if you granted the "token endpoint" permission to an application but NO "grant type" permission,
> it was assumed the client application was allowed to use the password or client credentials grants.
>
> Retrospectively, this logic was too complex and it removed in RC3 and **application permissions MUST now be explicitly granted**.

## Endpoint permissions

### Definition

Endpoint permissions limit the endpoints a client application can use.

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

### Disabling endpoint permissions

If you don't want to use endpoint permissions, call `options.IgnoreEndpointPermissions()` to ignore them:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.IgnoreEndpointPermissions();
    });
```

## Grant type permissions

### Definition

Grant type permissions limit the flows a client application is allowed to use.

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
            OpenIddictConstants.Permissions.Endpoints.Authorization,
            OpenIddictConstants.Permissions.Endpoints.Token,

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
            OpenIddictConstants.Permissions.Endpoints.Token,

            OpenIddictConstants.Permissions.GrantTypes.Password,
            OpenIddictConstants.Permissions.GrantTypes.RefreshToken
        }
    });
}
```

### Disabling grant type permissions

If you don't want to use grant type permissions, call `options.IgnoreGrantTypePermissions()` to ignore them:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.IgnoreGrantTypePermissions();
    });
```

## Scope permissions

### Definition

Scope permissions limit the scopes (standard or custom) a client application is allowed to use.

> The `openid` and `offline_access` scopes are special-cased by OpenIddict and don't require explicit permissions.

### Supported permissions

|  Scope  |                     Constant                     |
|:-------:|:------------------------------------------------:|
| address | `OpenIddictConstants.Permissions.Scopes.Address` |
| email   | `OpenIddictConstants.Permissions.Scopes.Email`   |
| phone   | `OpenIddictConstants.Permissions.Scopes.Phone`   |
| profile | `OpenIddictConstants.Permissions.Scopes.Profile` |
| roles   | `OpenIddictConstants.Permissions.Scopes.Roles`   |

To add a custom scope permission, you can use the following pattern:
```csharp
OpenIddictConstants.Permissions.Prefixes.Scope + "custom_scope_name"
```

### Example

In the following sample, the `angular` client is allowed to request the `address`,
`profile` and `marketing_api` scopes: any other scope will result in an error being returned.

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
            OpenIddictConstants.Permissions.Endpoints.Authorization,
            OpenIddictConstants.Permissions.GrantTypes.Implicit,

            OpenIddictConstants.Permissions.Scopes.Address,
            OpenIddictConstants.Permissions.Scopes.Profile,
            OpenIddictConstants.Permissions.Prefixes.Scope + "marketing_api"
        }
    });
}
```

### Disabling scope permissions

If you don't want to use scope permissions, call `options.IgnoreScopePermissions()` to ignore them:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.IgnoreScopePermissions();
    });
```