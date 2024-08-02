# Application permissions <Badge type="info" text="core" /><Badge type="danger" text="server" />

To control and limit the OAuth 2.0/OpenID Connect features client applications are able to use, the OpenIddict server
stack allows assigning them a list of application permissions: if the permission corresponding to a specific feature
has not been granted, the OpenIddict server automatically rejects the request with an error message indicating
the client application is not allowed to perform the requested action.

4 categories of permissions are currently supported by the server stack:
  - Endpoint permissions.
  - Grant type permissions.
  - Scope permissions.
  - Response type permissions (*introduced in OpenIddict 3.0*).

## Endpoint permissions

### Definition

Endpoint permissions limit the endpoints a client application can use.

### Supported permissions

|      Endpoint      |                          Constant                         |
|:------------------:|:---------------------------------------------------------:|
| Authorization      | `OpenIddictConstants.Permissions.Endpoints.Authorization` |
| Introspection      | `OpenIddictConstants.Permissions.Endpoints.Introspection` |
| Logout/end session | `OpenIddictConstants.Permissions.Endpoints.Logout`        |
| Revocation         | `OpenIddictConstants.Permissions.Endpoints.Revocation`    |
| Token              | `OpenIddictConstants.Permissions.Endpoints.Token`         |

### Example

In the following example, the `mvc` application is allowed to use the authorization, logout and
token endpoints but will get an error when trying to send an introspection or revocation request:

```csharp
if (await manager.FindByClientIdAsync("mvc") is null)
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

Grant type permissions limit the grant types a client application is allowed to use.

### Supported permissions

|     Grant type     |                            Constant                            |
|:------------------:|:--------------------------------------------------------------:|
| Authorization code | `OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode` |
| Client credentials | `OpenIddictConstants.Permissions.GrantTypes.ClientCredentials` |
| Implicit           | `OpenIddictConstants.Permissions.GrantTypes.Implicit`          |
| Password           | `OpenIddictConstants.Permissions.GrantTypes.Password`          |
| Refresh token      | `OpenIddictConstants.Permissions.GrantTypes.RefreshToken`      |

To add a custom grant type permission, you can use the following pattern:

```csharp
OpenIddictConstants.Permissions.Prefixes.GrantType + "custom_flow_name"
```

### Example

In the following example, the `postman` application can only use the authorization code grant
while `console` is restricted to the `password` and `refresh_token` grants:

```csharp
if (await manager.FindByClientIdAsync("postman") is null)
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

if (await manager.FindByClientIdAsync("console") is null)
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

> [!NOTE]
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
if (await manager.FindByClientIdAsync("angular") is null)
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

## Response type permissions

> [!NOTE]
> Response type permissions were introduced in OpenIddict 3.0.

### Definition

Response type permissions limit the response types a client application is allowed to use when implementing an interactive flow like code, implicit or hybrid.

### Supported permissions

| Response type       | Constant                                                         |
|:-------------------:|:----------------------------------------------------------------:|
| code                | `OpenIddictConstants.Permissions.ResponseTypes.Code`             |
| code id_token       | `OpenIddictConstants.Permissions.ResponseTypes.CodeIdToken`      |
| code id_token token | `OpenIddictConstants.Permissions.ResponseTypes.CodeIdTokenToken` |
| code token          | `OpenIddictConstants.Permissions.ResponseTypes.CodeToken`        |
| id_token            | `OpenIddictConstants.Permissions.ResponseTypes.IdToken`          |
| id_token token      | `OpenIddictConstants.Permissions.ResponseTypes.IdTokenToken`     |
| none                | `OpenIddictConstants.Permissions.ResponseTypes.None`             |
| token               | `OpenIddictConstants.Permissions.ResponseTypes.Token`            |

### Example

In the following example, the `postman` application can only use the `code id_token` response type:

```csharp
if (await manager.FindByClientIdAsync("postman") is null)
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

            OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode,

            OpenIddictConstants.Permissions.ResponseTypes.CodeIdToken
        }
    });
}
```

### Disabling response type permissions

If you don't want to use response type permissions, call `options.IgnoreResponseTypePermissions()` to ignore them:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.IgnoreResponseTypePermissions();
    });
```
