# 声明目标 <Badge type="danger" text="server" />

当从登录操作期间指定的 `ClaimsPrincipal` **生成授权码、刷新令牌和设备/用户代码时**，
**OpenIddict 服务器堆栈会自动将所有声明复制到生成的代码/令牌中**。这是一个安全的操作，因为这些令牌
始终是加密的，除了 OpenIddict 本身之外，任何人都无法读取（请求它们的用户或客户端应用程序无法读取其内容）。

**对于访问令牌和身份令牌，情况则有所不同**，因为这些令牌需要被不同的方读取：
  - 客户端应用程序可以完全访问其接收到的身份令牌中包含的声明。
  - 资源服务器应该能够读取 API 调用中使用的访问令牌中包含的声明。
  - 对于桌面、移动或基于浏览器的应用程序，用户通常不难访问身份令牌
（例如，通过使用 Fiddler 拦截 HTTP 响应、使用开发者工具或转储客户端进程的内存）。
  - 如果明确禁用了访问令牌加密，客户端应用程序或用户本身
可能能够访问访问令牌的内容（例如，通过复制令牌有效负载并使用 https://jwt.io/ 等工具）。

出于这些原因，**OpenIddict 服务器不会自动将附加到 `ClaimsPrincipal` 的声明复制到访问令牌或身份令牌中**
（除了 `sub` 声明，这是 OpenIddict 中唯一必需的声明）。要允许 OpenIddict 将特定声明
持久化到访问令牌或身份令牌中，必须为要暴露的每个 `Claim` 实例添加一个称为"声明目标"的标志。

> [!NOTE]
> 要将一个或多个目标附加到声明，请使用 `OpenIddict.Abstractions` 中定义的 `principal.SetDestinations()` 扩展。
> 在典型情况下，可以使用授予的范围来确定允许将哪些声明复制到访问令牌和身份令牌中，如下例所示：

```csharp
var principal = await _signInManager.CreateUserPrincipalAsync(user);

// 注意：在此示例中，授予的范围与请求的范围匹配
// 但您可能希望允许用户取消选中特定范围。
// 为此，只需在调用 SetScopes() 之前限制范围列表。
principal.SetScopes(request.GetScopes());
principal.SetResources(await _scopeManager.ListResourcesAsync(principal.GetScopes()).ToListAsync());
principal.SetDestinations(static claim => claim.Type switch
{
    // 如果授予了 "profile" 范围，则允许将 "name" 声明
    // 添加到从主体派生的访问令牌和身份令牌中。
    Claims.Name when claim.Subject.HasScope(Scopes.Profile) =>
    [
        OpenIddictConstants.Destinations.AccessToken,
        OpenIddictConstants.Destinations.IdentityToken
    ],

    // 永远不要将 "secret_value" 声明添加到访问令牌或身份令牌中。
    // 在这种情况下，它只会被添加到始终加密的授权码、
    // 刷新令牌和用户/设备代码中。
    "secret_value" => [],

    // 否则，仅将声明添加到访问令牌中。
    _ => [OpenIddictConstants.Destinations.AccessToken]
});

return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
```
