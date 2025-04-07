# 应用权限 <Badge type="info" text="core" /><Badge type="danger" text="server" />

为了控制和限制客户端应用程序可以使用的 OAuth 2.0/OpenID Connect 功能，OpenIddict 服务器堆栈允许为它们分配一系列应用权限：如果未授予与特定功能对应的权限，OpenIddict 服务器会自动拒绝请求，并返回错误消息，表明客户端应用程序不允许执行请求的操作。

服务器堆栈目前支持 4 类权限：
  - 端点权限
  - 授权类型权限
  - 范围权限
  - 响应类型权限

## 端点权限

### 定义

端点权限限制客户端应用程序可以使用的端点。

### 支持的权限

|       Endpoint       |                             Constant                            |
|:--------------------:|:---------------------------------------------------------------:|
| Authorization        | `OpenIddictConstants.Permissions.Endpoints.Authorization`       |
| Device authorization | `OpenIddictConstants.Permissions.Endpoints.DeviceAuthorization` |
| Introspection        | `OpenIddictConstants.Permissions.Endpoints.Introspection`       |
| End session          | `OpenIddictConstants.Permissions.Endpoints.EndSession`          |
| Pushed authorization | `OpenIddictConstants.Permissions.Endpoints.PushedAuthorization` |
| Revocation           | `OpenIddictConstants.Permissions.Endpoints.Revocation`          |
| Token                | `OpenIddictConstants.Permissions.Endpoints.Token`               |

### 示例

在以下示例中，`mvc` 应用程序被允许使用授权、结束会话和令牌端点，但在尝试发送内省或撤销请求时会收到错误：

```csharp
if (await manager.FindByClientIdAsync("mvc") is null)
{
    await manager.CreateAsync(new OpenIddictApplicationDescriptor
    {
        ClientId = "mvc",
        ClientSecret = "901564A5-E7FE-42CB-B10D-61EF6A8F3654",
        DisplayName = "MVC 客户端应用程序",
        PostLogoutRedirectUris = { new Uri("http://localhost:53507/signout-callback-oidc") },
        RedirectUris = { new Uri("http://localhost:53507/signin-oidc") },
        Permissions =
        {
            OpenIddictConstants.Permissions.Endpoints.Authorization,
            OpenIddictConstants.Permissions.Endpoints.EndSession,
            OpenIddictConstants.Permissions.Endpoints.Token
        }
    });
}
```

### 禁用端点权限

如果您不想使用端点权限，可以调用 `options.IgnoreEndpointPermissions()` 来忽略它们：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.IgnoreEndpointPermissions();
    });
```

## 授权类型权限

### 定义

授权类型权限限制客户端应用程序可以使用的授权类型。

### 支持的权限

|     授权类型     |                            常量                            |
|:---------------:|:----------------------------------------------------------:|
| 授权码          | `OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode` |
| 客户端凭证      | `OpenIddictConstants.Permissions.GrantTypes.ClientCredentials` |
| 隐式            | `OpenIddictConstants.Permissions.GrantTypes.Implicit`       |
| 密码            | `OpenIddictConstants.Permissions.GrantTypes.Password`       |
| 刷新令牌        | `OpenIddictConstants.Permissions.GrantTypes.RefreshToken`   |

要添加自定义授权类型权限，可以使用以下模式：

```csharp
OpenIddictConstants.Permissions.Prefixes.GrantType + "custom_flow_name"
```

### 示例

在以下示例中，`postman` 应用程序只能使用授权码授权，而 `console` 被限制为只能使用 `password` 和 `refresh_token` 授权：

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

### 禁用授权类型权限

如果您不想使用授权类型权限，可以调用 `options.IgnoreGrantTypePermissions()` 来忽略它们：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.IgnoreGrantTypePermissions();
    });
```

## 范围权限

### 定义

范围权限限制客户端应用程序可以使用的范围（标准或自定义）。

> [!NOTE]
> `openid` 和 `offline_access` 范围是 OpenIddict 的特殊情况，不需要显式权限。

### 支持的权限

|  范围  |                    常量                    |
|:------:|:------------------------------------------:|
| address | `OpenIddictConstants.Permissions.Scopes.Address` |
| email   | `OpenIddictConstants.Permissions.Scopes.Email`   |
| phone   | `OpenIddictConstants.Permissions.Scopes.Phone`   |
| profile | `OpenIddictConstants.Permissions.Scopes.Profile` |
| roles   | `OpenIddictConstants.Permissions.Scopes.Roles`   |

要添加自定义范围权限，可以使用以下模式：

```csharp
OpenIddictConstants.Permissions.Prefixes.Scope + "custom_scope_name"
```

### 示例

在以下示例中，`angular` 客户端被允许请求 `address`、`profile` 和 `marketing_api` 范围：任何其他范围都会导致返回错误。

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

### 禁用范围权限

如果您不想使用范围权限，可以调用 `options.IgnoreScopePermissions()` 来忽略它们：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.IgnoreScopePermissions();
    });
```

## 响应类型权限

> [!NOTE]
> 响应类型权限在 OpenIddict 3.0 中引入。

### 定义

响应类型权限限制客户端应用程序在实现交互式流程（如代码、隐式或混合）时可以使用的响应类型。

### 支持的权限

| 响应类型         | 常量                                                         |
|:---------------:|:------------------------------------------------------------:|
| code            | `OpenIddictConstants.Permissions.ResponseTypes.Code`         |
| code id_token   | `OpenIddictConstants.Permissions.ResponseTypes.CodeIdToken`  |
| code id_token token | `OpenIddictConstants.Permissions.ResponseTypes.CodeIdTokenToken` |
| code token      | `OpenIddictConstants.Permissions.ResponseTypes.CodeToken`    |
| id_token        | `OpenIddictConstants.Permissions.ResponseTypes.IdToken`      |
| id_token token  | `OpenIddictConstants.Permissions.ResponseTypes.IdTokenToken` |
| none            | `OpenIddictConstants.Permissions.ResponseTypes.None`         |
| token           | `OpenIddictConstants.Permissions.ResponseTypes.Token`        |

### 示例

在以下示例中，`postman` 应用程序只能使用 `code id_token` 响应类型：

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

### 禁用响应类型权限

如果您不想使用响应类型权限，可以调用 `options.IgnoreResponseTypePermissions()` 来忽略它们：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.IgnoreResponseTypePermissions();
    });
```
