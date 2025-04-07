# 授权码交换证明密钥 <Badge type="warning" text="client" /><Badge type="danger" text="server" />

最初设计用于防止移动应用程序的回调 URI 被同一设备上安装的恶意应用程序劫持，[授权码交换证明密钥 (PKCE)](https://datatracker.ietf.org/doc/html/rfc7636) 机制已扩展到机密客户端，以帮助缓解授权码泄露问题。

授权码交换证明密钥完全支持所有版本的 OpenIddict 客户端和服务器堆栈，OpenIddict 服务器可以配置为全局或按客户端强制执行此安全功能。

> [!TIP]
> 当配置元数据表明授权服务器支持此功能时，OpenIddict 客户端始终使用授权码交换证明密钥：
> 您无需在客户端级别进行任何配置即可启用它。

## 在全局级别启用 PKCE 强制执行 <Badge type="danger" text="server" />

可以通过在服务器选项中调用 `options.RequireProofKeyForCodeExchange()` 来全局强制执行授权码交换证明密钥：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.RequireProofKeyForCodeExchange();
    });
```

## 按客户端启用 PKCE 强制执行 <Badge type="danger" text="server" />

也可以通过将授权码交换证明密钥添加到附加到客户端的需求列表中来按客户端强制执行：

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
