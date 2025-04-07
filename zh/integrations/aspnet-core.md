# ASP.NET Core 集成 <Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

得益于其原生的 ASP.NET Core 集成，OpenIddict 提供的客户端、服务器和验证功能可以在任何 ASP.NET Core 2.1+ 应用程序中使用，无论它们使用的是 MVC 控制器、Razor Pages、最小 API 处理程序还是原始中间件。

## 支持的版本

| ASP.NET Core 版本 | .NET 运行时版本 |                                       |
|----------------------|----------------------|---------------------------------------|
| ASP.NET Core 2.1     | .NET Framework 4.6.2 | :heavy_check_mark: (有限制) |
| ASP.NET Core 2.1     | .NET Framework 4.7.2 | :heavy_check_mark:                    |
| ASP.NET Core 2.1     | .NET Framework 4.8   | :heavy_check_mark:                    |
| ASP.NET Core 2.1     | .NET Core 2.1        | :exclamation:                         |
|                      |                      |                                       |
| ASP.NET Core 3.1     | .NET Core 3.1        | :exclamation:                         |
|                      |                      |                                       |
| ASP.NET Core 5.0     | .NET 5.0             | :exclamation:                         |
| ASP.NET Core 6.0     | .NET 6.0             | :heavy_check_mark:                    |
| ASP.NET Core 7.0     | .NET 7.0             | :exclamation:                         |
| ASP.NET Core 8.0     | .NET 8.0             | :heavy_check_mark:                    |
| ASP.NET Core 9.0     | .NET 9.0             | :heavy_check_mark:                    |

> [!WARNING]
> **ASP.NET Core 2.1 on .NET Core 2.1、ASP.NET Core 3.1、5.0 和 7.0 不再受 Microsoft 支持。虽然 OpenIddict 仍然可以在这些平台上使用，这要归功于其 .NET Standard 2.0 兼容性，但强烈建议用户迁移到 ASP.NET Core 8.0 或 9.0**。
>
> ASP.NET Core 2.1 on .NET Framework 4.6.2（及更高版本）仍然完全受支持。

> [!NOTE]
> **以下功能在面向 .NET Framework 4.6.2 时不可用**：
>  - X.509 开发加密/签名证书：如果找不到有效的开发证书且必须生成新证书，调用 `AddDevelopmentEncryptionCertificate()` 或 `AddDevelopmentSigningCertificate()` 将在运行时抛出 `PlatformNotSupportedException`。
>  - X.509 ECDSA 签名证书/密钥：使用 ECDSA 证书/密钥调用 `AddSigningCertificate()` 或 `AddSigningKey()` 将始终在运行时抛出 `PlatformNotSupportedException`。

## 基本配置 <Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

要配置 ASP.NET Core 集成，您需要：
  - **引用 `OpenIddict.Client.AspNetCore` 和/或 `OpenIddict.Server.AspNetCore` 和/或 `OpenIddict.Validation.AspNetCore` 包**
  （取决于您的项目中是否需要客户端和/或服务器和/或验证功能）：

  ```xml
  <PackageReference Include="OpenIddict.Client.AspNetCore" Version="6.2.0" />
  <PackageReference Include="OpenIddict.Server.AspNetCore" Version="6.2.0" />
  <PackageReference Include="OpenIddict.Validation.AspNetCore" Version="6.2.0" />
  ```

  - **为每个要添加的 OpenIddict 功能（客户端、服务器和验证）调用 `UseAspNetCore()`**：

  ```csharp
  services.AddOpenIddict()
      .AddCore(options =>
      {
          // ...
      })
      .AddClient(options =>
      {
          // ...
  
          options.UseAspNetCore();
      })
      .AddServer(options =>
      {
          // ...
  
          options.UseAspNetCore();
      })
      .AddValidation(options =>
      {
          // ...
  
          options.UseAspNetCore();
      });
  ```

> [!WARNING]
> OpenIddict 使用 `IAuthenticationRequestHandler` 服务与 ASP.NET Core 集成。
>
> 因此，确保 ASP.NET Core 身份验证中间件在管道中的正确位置注册至关重要（即在 `app.UseCors()` 之后和 `app.UseEndpoint()` 之前）：
>
>  ```csharp
>  app.UseDeveloperExceptionPage();
>  app.UseStatusCodePagesWithReExecute("/error");
>
>  app.UseRouting();
>  app.UseCors();
>
>  app.UseAuthentication();
>  app.UseAuthorization();
>
>  app.UseEndpoints(options =>
>  {
>      options.MapControllers();
>      options.MapDefaultControllerRoute();
>  });
>  ```

## 高级配置

### 传输安全要求 <Badge type="warning" text="client" /><Badge type="danger" text="server" />

默认情况下，出于安全原因，OpenIddict 服务器 ASP.NET Core 集成将拒绝服务非 HTTPS 请求，并向调用者返回错误页面。

出于同样的原因，OpenIddict 客户端 ASP.NET Core 主机默认情况下将拒绝从非 HTTPS 页面启动身份验证挑战，并自动抛出异常以中止这些不安全操作。

虽然在大多数情况下强烈不建议禁用此要求，但可以使用 `DisableTransportSecurityRequirement()` API 禁用它：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseAspNetCore()
               .DisableTransportSecurityRequirement();
    })
    .AddServer(options =>
    {
        options.UseAspNetCore()
               .DisableTransportSecurityRequirement();
    });
```

> [!CAUTION]
> **在生产环境中永远不应禁用传输安全要求**，即使在使用进行 TLS 终止的反向代理时也是如此：如果请求被 OpenIddict 在 TLS 终止时拒绝，这很可能意味着 ASP.NET Core 应用程序未正确配置以提取和恢复原始请求详细信息（更具体地说，是 `HttpRequest.Scheme`）。
>
> 有关更多信息，请阅读[配置 ASP.NET Core 以与代理服务器和负载均衡器配合使用](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer)。

### 直通模式 <Badge type="warning" text="client" /><Badge type="danger" text="server" />

OpenIddict 客户端和服务器堆栈提供的 ASP.NET Core 集成为一些内置端点（通常是用户希望提供自定义逻辑的端点）提供了内置的直通支持。

> [!NOTE]
> 有关直通模式的更多信息，请阅读[直通支持](/introduction.md#pass-through-support)。

可以使用 `OpenIddictClientAspNetCoreBuilder` 或 `OpenIddictServerAspNetCoreBuilder` 公开的 API 为特定端点启用直通模式。例如，对于授权端点：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        // ...

        options.UseAspNetCore()
               .EnableAuthorizationEndpointPassthrough();
    });
```

启用后，您可以在 MVC 控制器或最小 API 处理程序中处理授权请求：

```csharp
app.MapMethods("authorize", [HttpMethods.Get, HttpMethods.Post], async (HttpContext context) =>
{
    // 解析 GitHub 身份验证后创建的 cookie 中存储的声明。
    // 如果找不到主体，则触发新的质询以将用户重定向到 GitHub。
    //
    // 对于不应使用 ASP.NET Core 身份验证选项中配置的默认身份验证处理程序的场景，
    // 可以在此处指定特定的方案。
    var principal = (await context.AuthenticateAsync())?.Principal;
    if (principal is null)
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = context.Request.GetEncodedUrl()
        };

        return Results.Challenge(properties, [Providers.GitHub]);
    }

    var identifier = principal.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    // 创建将由 OpenIddict 用于生成令牌的基于声明的身份。
    var identity = new ClaimsIdentity(
        authenticationType: TokenValidationParameters.DefaultAuthenticationType,
        nameType: Claims.Name,
        roleType: Claims.Role);

    // 从存储在本地 cookie 中的身份导入一些选定的声明。
    identity.AddClaim(new Claim(Claims.Subject, identifier));
    identity.AddClaim(new Claim(Claims.Name, identifier).SetDestinations(Destinations.AccessToken));
    identity.AddClaim(new Claim(Claims.PreferredUsername, identifier).SetDestinations(Destinations.AccessToken));

    return Results.SignIn(new ClaimsPrincipal(identity), properties: null, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
});
```

### 状态码页面中间件集成 <Badge type="warning" text="client" /><Badge type="danger" text="server" />

OpenIddict 客户端和服务器 ASP.NET Core 主机都提供了使用[ASP.NET Core 的状态码页面中间件](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling#usestatuscodepages)渲染错误页面的选项。

要启用此功能，您可以使用专用的 `EnableStatusCodePagesIntegration()` API：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseAspNetCore()
               .EnableStatusCodePagesIntegration();
    });
```

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.UseAspNetCore()
               .EnableStatusCodePagesIntegration();
    });
```

> [!WARNING]
> 您需要确保状态码页面中间件在 ASP.NET Core 管道中的适当位置注册（即在 `app.UseAuthentication()` 之前）：
>
>  ```csharp
>  app.UseDeveloperExceptionPage();
>  app.UseStatusCodePagesWithReExecute("/error");
>
>  app.UseRouting();
>  app.UseCors();
>
>  app.UseAuthentication();
>  app.UseAuthorization();
>
>  app.UseEndpoints(options =>
>  {
>      options.MapControllers();
>      options.MapDefaultControllerRoute();
>  });
>  ```

启用后，创建一个错误控制器来处理错误响应：

```csharp
public class ErrorController : Controller
{
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true), Route("~/error")]
    public IActionResult Error()
    {
        // 如果错误来自 OpenIddict 客户端，渲染错误详细信息。
        var response = HttpContext.GetOpenIddictClientResponse();
        if (response is not null)
        {
            return View(new ErrorViewModel
            {
                Error = response.Error,
                ErrorDescription = response.ErrorDescription
            });
        }

        return View(new ErrorViewModel());
    }
}
```

```csharp
public class ErrorController : Controller
{
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true), Route("~/error")]
    public IActionResult Error()
    {
        // 如果错误来自 OpenIddict 服务器，渲染错误详细信息。
        var response = HttpContext.GetOpenIddictServerResponse();
        if (response is not null)
        {
            return View(new ErrorViewModel
            {
                Error = response.Error,
                ErrorDescription = response.ErrorDescription
            });
        }

        return View(new ErrorViewModel());
    }
}
```

> [!TIP]
> 如果您在同一应用程序中同时使用 OpenIddict 客户端和 OpenIddict 服务器，您可以配置两个堆栈都使用状态码页面中间件。在这种情况下，您需要使用 `HttpContext.GetOpenIddictClientResponse()` 和 `HttpContext.GetOpenIddictServerResponse()` 来解析错误响应：
>
> ```csharp
> public class ErrorController : Controller
> {
>     [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true), Route("~/error")]
>     public IActionResult Error()
>     {
>         // 如果错误来自 OpenIddict 客户端或服务器，渲染错误详细信息。
>         var response = HttpContext.GetOpenIddictClientResponse() ?? HttpContext.GetOpenIddictServerResponse();
>         if (response is not null)
>         {
>             return View(new ErrorViewModel
>             {
>                 Error = response.Error,
>                 ErrorDescription = response.ErrorDescription
>             });
>         }
>
>         return View(new ErrorViewModel());
>     }
> }
> ```

### 授权和注销请求缓存 <Badge type="danger" text="server" />

为了简化大型授权或注销请求的流动，OpenIddict 服务器 ASP.NET Core 集成包含一个内置功能，允许生成唯一的 `request_uri` 并在 OpenIddict 的令牌表中缓存接收到的请求：启用此功能后，OpenIddict 会触发到当前页面的自动重定向，并移除其他参数，一旦用户完成授权或注销请求，令牌条目就会被兑换。

要启用此功能，您需要使用专用的 `EnableAuthorizationRequestCaching()` 和/或 `EnableLogoutEndpointPassthrough()` API：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.EnableAuthorizationRequestCaching()
               .EnableLogoutEndpointPassthrough();
    });
```

### 身份验证方案转发 <Badge type="warning" text="client" />

为了简化触发特定客户端注册的身份验证操作，OpenIddict 客户端提供了一个内置的身份验证方案转发功能，允许在 ASP.NET Core 中使用分配给客户端注册的提供程序名称作为身份验证方案：

```csharp
app.MapGet("challenge", () => Results.Challenge(properties: null, authenticationSchemes: [Providers.GitHub]));
```

此功能默认启用，但可以使用 `DisableAutomaticAuthenticationSchemeForwarding()` 在必要时禁用它：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseAspNetCore()
               .DisableAutomaticAuthenticationSchemeForwarding();
    });
```

如果您只需要为特定注册启用转发，可以使用高级 `AddForwardedAuthenticationScheme()` API 选择性地添加您想要的方案：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseAspNetCore()
               .DisableAutomaticAuthenticationSchemeForwarding()
               .AddForwardedAuthenticationScheme(provider: "Contoso", caption: "Contoso Intranet login");
    });
```

当自动转发被禁用时，如果没有配置显式转发，身份验证操作不能直接使用提供程序名称作为身份验证方案，而必须使用 `OpenIddictClientAspNetCoreDefaults.AuthenticationScheme` 和包含提供程序名称、颁发者 URI 或注册标识符的 `AuthenticationProperties` 实例：

```csharp
app.MapGet("challenge", () =>
{
    var properties = new AuthenticationProperties(new Dictionary<string, string?>
    {
        [OpenIddictClientAspNetCoreConstants.Properties.ProviderName] = Providers.GitHub
    });

    return Results.Challenge(properties, authenticationSchemes: [OpenIddictClientAspNetCoreDefaults.AuthenticationScheme]);
});
```

### JSON 响应缩进 <Badge type="danger" text="server" />

默认情况下，OpenIddict 服务器 ASP.NET Core 主机将返回缩进的 JSON 响应，使其更易于阅读。

希望禁用 JSON 响应缩进的用户可以通过调用 `SuppressJsonResponseIndentation()` 来实现：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.UseAspNetCore()
               .SuppressJsonResponseIndentation();
    });
```
