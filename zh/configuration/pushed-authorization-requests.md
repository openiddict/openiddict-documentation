# 推送授权请求 <Badge type="warning" text="client" /><Badge type="danger" text="server" />

OAuth 2.0 推送授权请求（简称 PAR）是一个[规范](https://datatracker.ietf.org/doc/html/rfc9126)，旨在为机密客户端提供完整性保护的授权请求：
通过在后端通道通信中发送实际的请求参数，然后在重定向用户代理到常规授权端点时附加唯一的随机 `request_uri`，
授权流程只能由合法客户端发起，授权请求的内容不能被最终用户或恶意方实时篡改。

虽然这种机制提供的保护主要使机密应用程序受益，
但公共客户端（如浏览器应用程序、移动或桌面应用程序）也可以使用它。

OpenIddict 6.1.0 及更高版本完全支持推送授权请求的客户端和服务器端。

> [!TIP]
> 当配置元数据表明授权服务器支持此功能时，OpenIddict 客户端始终使用推送授权请求：
> 您无需在客户端级别进行任何配置即可启用它。

## 启用推送授权端点 <Badge type="danger" text="server" />

与所有服务器端点（除了配置和 JSON Web 密钥集端点）一样，推送授权端点是可选的，
必须明确启用后客户端应用程序才能开始发送推送授权请求：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.SetPushedAuthorizationEndpointUris("connect/par");
    });
```

## 允许客户端应用程序使用推送授权端点 <Badge type="danger" text="server" />

除非使用 `options.IgnoreEndpointPermissions()` API 明确禁用端点权限，否则客户端应用程序
必须被明确授予推送授权端点权限才能与此端点通信：

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
> 有关权限的更多信息，请阅读[应用程序权限](application-permissions.md)。

## 在全局级别启用 PAR 强制 <Badge type="danger" text="server" />

可以通过在服务器选项中调用 `options.RequirePushedAuthorizationRequests()` 来全局强制推送授权请求：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.RequirePushedAuthorizationRequests();
    });
```

## 按客户端启用 PAR 强制 <Badge type="danger" text="server" />

推送授权请求也可以通过将其添加到附加到客户端的需求列表中来按客户端强制：

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

## 禁用特定客户端注册或 Web 提供程序的 PAR 支持 <Badge type="warning" text="client" />

虽然建议所有客户端（公共或机密）在可用时都使用 OAuth 2.0 推送授权请求，
但可以在客户端注册中或使用 Web 提供程序 API 明确禁用此功能：

### 使用 `OpenIddictClientRegistration.DisablePushedAuthorizationRequests` 禁用 PAR

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

### 使用 `options.DisablePushedAuthorizationRequests()` 禁用 PAR

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
