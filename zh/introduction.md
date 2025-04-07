# 简介

OpenIddict 是一个**免费开源的框架，用于在 .NET 中构建灵活且符合标准的 OAuth 2.0/OpenID Connect 客户端和服务器**。

## 历史

OpenIddict 诞生于2015年底，最初基于 [AspNet.Security.OpenIdConnect.Server](https://github.com/aspnet-contrib/AspNet.Security.OpenIdConnect.Server)
（简称 ASOS）。ASOS 是一个受 Microsoft 为 OWIN 项目开发的 OAuth 2.0 授权服务器中间件启发的低级 OpenID Connect 服务器中间件，也是为 ASP.NET Core 创建的第一个 OpenID Connect 服务器。

在2020年，ASOS 被合并到 OpenIddict 3.0+ 中，在 OpenIddict 框架下形成了一个统一的技术栈。它为新用户提供了易用的方法，同时通过"降级模式"为高级用户提供低级别的使用体验，允许以无状态方式（即不需要后端数据库）使用 OpenIddict。

作为这个过程的一部分，OpenIddict 3.0+ 增加了对 `Microsoft.Owin` 的原生支持，使其可以在传统的 ASP.NET 4.6.1（及更高版本）应用程序中使用。这使其成为替换 `OAuthAuthorizationServerMiddleware` 和 `OAuthBearerAuthenticationMiddleware` 的绝佳选择，而无需迁移到 ASP.NET Core。

在2022年，一个全新的 OAuth 2.0 + OpenID Connect 客户端技术栈被添加到 OpenIddict 中，并随之发布了 `OpenIddict.Client.WebIntegration` 配套包，旨在替代现有的 [aspnet-contrib 社交提供程序](https://github.com/aspnet-contrib/AspNet.Security.OAuth.Providers)
（aspnet-contrib 提供程序仍然受支持，但对于新应用程序，强烈推荐使用 OpenIddict Web 提供程序）。

为了使 OpenIddict 客户端在更多场景中可用，OpenIddict 4.1 添加了对桌面应用程序的完整支持，而自 OpenIddict 5.8 起也支持移动平台。

## 核心概念

### 模块化设计

OpenIddict 采用完全模块化的设计，提供了3个强大的技术栈，可以一起使用或独立使用：

  - 客户端技术栈，可用于与远程 OAuth 2.0/OpenID Connect 服务器集成。
  - 服务器技术栈，可用于创建自己的 OAuth 2.0/OpenID Connect 服务器。
  - 验证技术栈，可用于在 API 中实现令牌认证。

这3个技术栈是独立配置的，可以使用提供持久化逻辑的 `OpenIddict.Core` 包：

```csharp
services.AddOpenIddict()
    .AddCore(options =>
    {
        // ...
    })
    .AddClient(options =>
    {
        // ...
    })
    .AddServer(options =>
    {
        // ...
    })
    .AddValidation(options =>
    {
        // ...
    });
```

### 解耦设计

为了在所有支持的平台上提供统一的体验，OpenIddict 的客户端、服务器和验证技术栈被设计为避免与特定主机或平台紧密耦合。因此，`OpenIddict.Client`、`OpenIddict.Server` 和 `OpenIddict.Validation` 包有意不依赖于 ASP.NET Core，仅包含可用于任何实现（包括非官方主机）的通用逻辑：提供了像 `OpenIddict.Client.AspNetCore` 或 `OpenIddict.Client.Owin` 这样的配套包来支持与特定主机集成。

出于同样的原因，持久化逻辑不绑定到特定的 ORM 或数据库：虽然默认支持 **[Entity Framework Core](/integrations/entity-framework-core.md)**、**[Entity Framework 6.x](/integrations/entity-framework.md)** 和 **[MongoDB](/integrations/mongodb.md)**，但也可以实现自定义存储以支持任何其他提供程序。

### 用户认证

与其他解决方案不同，**OpenIddict 专注于授权过程中的 OAuth 2.0/OpenID Connect 协议方面**，而将用户认证留给实现者：OpenIddict 可以原生地与任何形式的用户认证一起使用，如密码、令牌、联合身份验证或集成 Windows 认证（NTLM/Kerberos）。虽然使用像 ASP.NET Core Identity 这样的成员资格堆栈很方便，但这并不是必需的。

### 直通支持

与 `OAuthAuthorizationServerMiddleware` 类似，OpenIddict 服务器允许在自定义控制器操作或任何其他能够挂钩到 ASP.NET Core 或 OWIN 请求处理管道的中间件中处理授权、注销和令牌请求。在这种情况下，OpenIddict 将始终首先验证传入的请求（例如，确保必需的参数存在且有效），然后才允许调用管道的其余部分：如果出现任何验证错误，OpenIddict 将在请求到达用户定义的控制器操作或自定义中间件之前自动拒绝该请求。

OpenIddict 客户端技术栈中也存在完全相同的概念，其中直通模式可用于在自定义代码中处理回调/重定向请求（例如，控制器操作、Razor 页面、Web 表单或最小 API 处理程序），并应用应用程序需要的任何逻辑（例如，过滤声明、将身份存储在认证 cookie 中等）。

```csharp
builder.Services.AddOpenIddict()
    .AddServer(options =>
    {
        // Enable the authorization and token endpoints.
        options.SetAuthorizationEndpointUris("/authorize")
               .SetTokenEndpointUris("/token");

        // Enable the authorization code flow.
        options.AllowAuthorizationCodeFlow();

        // Register the signing and encryption credentials.
        options.AddDevelopmentEncryptionCertificate()
               .AddDevelopmentSigningCertificate();

        // Register the ASP.NET Core host and configure the authorization endpoint
        // to allow the /authorize minimal API handler to handle authorization requests
        // after being validated by the built-in OpenIddict server event handlers.
        //
        // Token requests will be handled by OpenIddict itself by reusing the identity
        // created by the /authorize handler and stored in the authorization codes.
        options.UseAspNetCore()
               .EnableAuthorizationEndpointPassthrough();
    });
```

```csharp
app.MapGet("/authorize", async (HttpContext context) =>
{
    // Resolve the claims stored in the principal created after the Steam authentication dance.
    // If the principal cannot be found, trigger a new challenge to redirect the user to Steam.
    var principal = (await context.AuthenticateAsync(SteamAuthenticationDefaults.AuthenticationScheme))?.Principal;
    if (principal is null)
    {
        return Results.Challenge(properties: null, [SteamAuthenticationDefaults.AuthenticationScheme]);
    }

    var identifier = principal.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    // Create a new identity and import a few select claims from the Steam principal.
    var identity = new ClaimsIdentity(TokenValidationParameters.DefaultAuthenticationType);
    identity.AddClaim(new Claim(Claims.Subject, identifier));
    identity.AddClaim(new Claim(Claims.Name, identifier).SetDestinations(Destinations.AccessToken));

    return Results.SignIn(new ClaimsPrincipal(identity), properties: null, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
});
```

### 事件模型

OpenIddict 为其客户端、服务器和验证技术栈实现了一个强大的基于事件的模型：请求处理逻辑的每个部分都被实现为一个事件处理程序，可以被移除、移动到管道中的不同位置或被自定义处理程序替换，以覆盖 OpenIddict 使用的默认逻辑：

```csharp
/// <summary>
/// 包含负责拒绝未指定有效提示参数的授权请求的逻辑。
/// </summary>
public class ValidatePromptParameter : IOpenIddictServerHandler<ValidateAuthorizationRequestContext>
{
    /// <summary>
    /// 获取分配给此处理程序的默认描述符定义。
    /// </summary>
    public static OpenIddictServerHandlerDescriptor Descriptor { get; }
        = OpenIddictServerHandlerDescriptor.CreateBuilder<ValidateAuthorizationRequestContext>()
            .UseSingletonHandler<ValidatePromptParameter>()
            .SetOrder(ValidateNonceParameter.Descriptor.Order + 1_000)
            .SetType(OpenIddictServerHandlerType.BuiltIn)
            .Build();

    /// <inheritdoc/>
    public ValueTask HandleAsync(ValidateAuthorizationRequestContext context)
    {
        if (context is null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        // 拒绝同时指定 prompt=none 和 consent/login 或 select_account 的请求。
        if (context.Request.HasPrompt(Prompts.None) && (context.Request.HasPrompt(Prompts.Consent) ||
                                                        context.Request.HasPrompt(Prompts.Login) ||
                                                        context.Request.HasPrompt(Prompts.SelectAccount)))
        {
            context.Logger.LogInformation(SR.GetResourceString(SR.ID6040));

            context.Reject(
                error: Errors.InvalidRequest,
                description: SR.FormatID2052(Parameters.Prompt),
                uri: SR.FormatID8000(SR.ID2052));

            return default;
        }

        return default;
    }
}
```

在 OpenIddict 中，事件处理程序通常被定义为专用类，但也可以使用委托注册：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.AddEventHandler<HandleConfigurationRequestContext>(builder =>
            builder.UseInlineHandler(context =>
            {
                // 将自定义元数据附加到配置文档。
                context.Metadata["custom_metadata"] = 42;

                return default;
            }));
    });
```

### 降级模式

降级模式旨在为高级用户提供低级别的体验，允许以无状态方式使用 OpenIddict，方法是禁用通常依赖于 `OpenIddict.Core` 包的所有功能，包括 `client_id`/`client_secret` 或 `redirect_uri` 验证、引用令牌和令牌撤销支持等功能。由于在启用降级模式时这些关键部分不由 OpenIddict 处理，因此您需要注册自定义事件处理程序，使用您自己的逻辑（和您自己的数据库！）来实现必要的功能。

> [!TIP]
> 有关降级模式的更多信息，请阅读
> [使用 OpenIddict 3.0 的降级模式创建 OpenID Connect 服务器代理](https://kevinchalet.com/2020/02/18/creating-an-openid-connect-server-proxy-with-openiddict-3-0-s-degraded-mode/)。
