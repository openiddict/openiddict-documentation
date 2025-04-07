# 授权存储 <Badge type="info" text="core" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

为了跟踪令牌和用户同意的逻辑链，OpenIddict 服务器支持在数据库中存储授权（在某些 OpenID Connect 实现中也称为"授权"），并在代码中使用它们来确定是否应该返回同意视图，这取决于您自己的逻辑。

## 授权类型

授权可以分为两种类型：永久授权和临时授权。

### 永久授权

**永久授权是由开发人员定义的授权**，使用 `IOpenIddictAuthorizationManager.CreateAsync()` API 创建，并使用 OpenIddict 特定的 `principal.SetAuthorizationId()` 扩展方法显式附加到 `ClaimsPrincipal`。

此类授权通常用于记住用户同意，避免为每个授权请求显示同意视图。为此，可以为每个应用程序定义一个"同意类型"，如下例所示：

```csharp
// 从数据库中检索应用程序详细信息
var application = await _applicationManager.FindByClientIdAsync(request.ClientId) ??
    throw new InvalidOperationException("The application cannot be found.");

// 检索与用户和应用程序关联的永久授权
var authorizations = await _authorizationManager.FindAsync(
    subject: await _userManager.GetUserIdAsync(user),
    client : await _applicationManager.GetIdAsync(application),
    status : Statuses.Valid,
    type   : AuthorizationTypes.Permanent,
    scopes : request.GetScopes()).ToListAsync();

switch (await _applicationManager.GetConsentTypeAsync(application))
{
    // 如果同意是外部的（例如当授权由系统管理员授予时），
    // 如果在数据库中找不到授权，则立即返回错误。
    case ConsentTypes.External when !authorizations.Any():
        return Forbid(
            authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            properties: new AuthenticationProperties(new Dictionary<string, string>
            {
                [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.ConsentRequired,
                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                    "The logged in user is not allowed to access this client application."
            }));

    // 如果同意是隐式的或找到了授权，
    // 无需显示同意表单即可返回授权响应。
    case ConsentTypes.Implicit:
    case ConsentTypes.External when authorizations.Any():
    case ConsentTypes.Explicit when authorizations.Any() && !request.HasPrompt(Prompts.Consent):
        // 创建将由OpenIddict用于生成令牌的基于声明的身份。
        var identity = new ClaimsIdentity(
            authenticationType: TokenValidationParameters.DefaultAuthenticationType,
            nameType: Claims.Name,
            roleType: Claims.Role);

        // 添加将在令牌中持久化的声明。
        identity.SetClaim(Claims.Subject, await _userManager.GetUserIdAsync(user))
                .SetClaim(Claims.Email, await _userManager.GetEmailAsync(user))
                .SetClaim(Claims.Name, await _userManager.GetUserNameAsync(user))
                .SetClaims(Claims.Role, (await _userManager.GetRolesAsync(user)).ToImmutableArray());

        // 注意：在此示例中，授予的作用域与请求的作用域匹配
        // 但您可能希望允许用户取消选中特定作用域。
        // 为此，只需在调用SetScopes之前限制作用域列表即可。
        identity.SetScopes(request.GetScopes());
        identity.SetResources(await _scopeManager.ListResourcesAsync(identity.GetScopes()).ToListAsync());

        // 自动创建永久授权，以避免将来包含相同作用域的
        // 授权或令牌请求需要明确同意。
        var authorization = authorizations.LastOrDefault();
        authorization ??= await _authorizationManager.CreateAsync(
            identity: identity,
            subject : await _userManager.GetUserIdAsync(user),
            client  : await _applicationManager.GetIdAsync(application),
            type    : AuthorizationTypes.Permanent,
            scopes  : identity.GetScopes());

        identity.SetAuthorizationId(await _authorizationManager.GetIdAsync(authorization));
        identity.SetDestinations(static claim => claim.Type switch
        {
            // 如果授予了"profile"作用域，允许将"name"声明
            // 添加到从principal派生的访问令牌和身份令牌中。
            Claims.Name when claim.Subject.HasScope(Scopes.Profile) =>
            [
                OpenIddictConstants.Destinations.AccessToken,
                OpenIddictConstants.Destinations.IdentityToken
            ],

            // 永远不要将"secret_value"声明添加到访问令牌或身份令牌中。
            // 在这种情况下，它只会被添加到始终加密的授权码、
            // 刷新令牌和用户/设备码中。
            "secret_value" => [],

            // 否则，仅将声明添加到访问令牌中。
            _ => [OpenIddictConstants.Destinations.AccessToken]
        });

        return SignIn(new ClaimsPrincipal(identity), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);

    // 此时，在数据库中找不到授权，如果客户端应用程序
    // 在授权请求中指定了prompt=none，则必须返回错误。
    case ConsentTypes.Explicit   when request.HasPrompt(Prompts.None):
    case ConsentTypes.Systematic when request.HasPrompt(Prompts.None):
        return Forbid(
            authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            properties: new AuthenticationProperties(new Dictionary<string, string>
            {
                [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.ConsentRequired,
                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                    "Interactive user consent is required."
            }));

    // 在所有其他情况下，渲染同意表单。
    default: return View(new AuthorizeViewModel
    {
        ApplicationName = await _applicationManager.GetLocalizedDisplayNameAsync(application),
        Scope = request.Scope
    });
}
```

### 临时授权

**临时授权是由 OpenIddict 自动创建的，当需要出于安全原因跟踪令牌链时**，但开发人员没有将显式的永久授权附加到用于登录操作的 `ClaimsPrincipal`。

此类授权通常在授权码流程中创建，以链接与原始授权码相关的所有令牌，这样如果授权码被多次兑换（这可能表明令牌泄露），它们可以自动撤销。同样，当在资源所有者密码凭据授权请求中返回刷新令牌时，也会创建临时授权。

> [!NOTE]
> 当使用 [OpenIddict.Quartz](https://www.nuget.org/packages/OpenIddict.Quartz/) 集成时，临时授权会在短时间内（默认为 14 天）自动从数据库中删除。与临时授权不同，永久授权永远不会从数据库中删除。

## 在 API 级别启用授权条目验证 <Badge type="tip" text="validation" />

**出于性能原因，OpenIddict 3.0+ 默认情况下不会在接收 API 请求时检查授权条目的状态**：即使附加的授权被撤销，访问令牌也被视为有效。对于需要立即撤销授权的场景，可以配置 OpenIddict 验证处理程序以对每个 API 请求强制执行授权条目验证：

> [!NOTE]
> 启用授权条目验证要求 OpenIddict 验证处理程序直接访问存储授权的服务器数据库，这使其更适合位于与授权服务器相同的应用程序中的 API。
> 对于外部应用程序，请考虑使用自省而不是本地验证。
>
> 在这两种情况下，都会产生额外的延迟 - 由额外的数据库请求和自省的 HTTP 调用引起。

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.EnableAuthorizationEntryValidation();
    });
```

## 禁用授权存储 <Badge type="danger" text="server" />

虽然**强烈不推荐**，但可以在服务器选项中禁用授权存储：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.DisableAuthorizationStorage();
    });
```
