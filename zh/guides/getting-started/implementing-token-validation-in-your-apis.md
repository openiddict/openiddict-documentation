# 在 API 中实现令牌验证 <Badge type="tip" text="validation" />

> [!NOTE]
> 本指南假设你使用 ASP.NET Core 来托管你的 API。有关如何在 ASP.NET 4.6.1+ 应用程序中使用 OpenIddict 验证功能的示例，
> 请参见 [OWIN/ASP.NET 4.8 示例](https://github.com/openiddict/openiddict-samples?tab=readme-ov-file#owinaspnet-48-samples)。

**为你的 API 实现令牌验证支持，最简单的方法是克隆官方示例**
从 [openiddict-samples 仓库](https://github.com/openiddict/openiddict-samples)。

如果你不想从推荐的示例开始，你需要：

  - **引用 `OpenIddict.AspNetCore` 包**：

  ```xml
  <PackageReference Include="OpenIddict.AspNetCore" Version="6.2.0" />
  ```

  - **在 `Startup.ConfigureServices` 中配置 OpenIddict 验证服务**：
    - 如果 API 与 OpenIddict 服务器位于同一项目中，你可以使用 `options.UseLocalServer()`
    API 从本地服务器实例导入配置，包括签名和加密密钥：

    ```csharp
    services.AddOpenIddict()

        // 注册 OpenIddict 验证组件。
        .AddValidation(options =>
        {
            // 从本地 OpenIddict 服务器实例导入配置。
            options.UseLocalServer();

            // 注册 ASP.NET Core 主机。
            options.UseAspNetCore();
        });
    ```

    - 如果 API 位于不同的项目中，你需要使用 OpenID Connect 发现从远程服务器实例下载配置，
    包括公共签名密钥。你还需要更新服务器配置以使用将与 API 共享的密钥或 X.509 加密证书，
    以便能够解密接收到的访问令牌：

    ```csharp
    services.AddOpenIddict()
        .AddServer(options =>
        {    
            // 注册加密凭据。此示例使用在服务器和 API 项目之间共享的对称
            // 加密密钥。
            //
            // 注意：在实际应用中，此加密密钥应存储在安全的地方
            //（例如 Azure KeyVault，作为密钥存储）。
            options.AddEncryptionKey(new SymmetricSecurityKey(
                Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));

            // 注册签名凭据。
            options.AddDevelopmentSigningCertificate();
        });
    ```

    ```csharp
    services.AddOpenIddict()
        .AddValidation(options =>
        {
            // 注意：验证处理程序使用 OpenID Connect 发现
            // 来检索用于验证令牌的颁发者签名密钥。
            options.SetIssuer("https://localhost:44319/");

            // 注册加密凭据。此示例使用在服务器和 API 项目之间共享的对称
            // 加密密钥。
            //
            // 注意：在实际应用中，此加密密钥应存储在安全的地方
            //（例如 Azure KeyVault，作为密钥存储）。
            options.AddEncryptionKey(new SymmetricSecurityKey(
                Convert.FromBase64String("DRjd/GnduI3Efzen9V9BvbNUfc/VKgXltV7Kbk9sMkY=")));

            // 注册 System.Net.Http 集成。
            options.UseSystemNetHttp();

            // 注册 ASP.NET Core 主机。
            options.UseAspNetCore();
        });
    ```

  - **配置你的 API 控制器** 以使用令牌认证，通过使用
  `[Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]` 装饰它们：

    ```csharp
    [Authorize(AuthenticationSchemes = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme)]
    [Route("api")]
    public class ResourceController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ResourceController(UserManager<ApplicationUser> userManager)
            => _userManager = userManager;

        [HttpGet("message")]
        public async Task<IActionResult> GetMessage()
        {
            // 此演示操作要求客户端应用程序被授予 "demo_api" 范围。
            // 如果未授予，则向客户端应用程序返回详细错误，通知它
            // 必须使用指定的范围重新启动授权过程才能访问此 API。
            if (!User.HasScope("demo_api"))
            {
                return Forbid(
                    authenticationSchemes: OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(new Dictionary<string, string>
                    {
                        [OpenIddictValidationAspNetCoreConstants.Properties.Scope] = "demo_api",
                        [OpenIddictValidationAspNetCoreConstants.Properties.Error] = Errors.InsufficientScope,
                        [OpenIddictValidationAspNetCoreConstants.Properties.ErrorDescription] =
                            "The 'demo_api' scope is required to perform this action."
                    }));
            }

            var user = await _userManager.FindByIdAsync(User.GetClaim(Claims.Subject));
            if (user is null)
            {
                return Challenge(
                    authenticationSchemes: OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(new Dictionary<string, string>
                    {
                        [OpenIddictValidationAspNetCoreConstants.Properties.Error] = Errors.InvalidToken,
                        [OpenIddictValidationAspNetCoreConstants.Properties.ErrorDescription] =
                            "The specified access token is bound to an account that no longer exists."
                    }));
            }

            return Content($"{user.UserName} has been successfully authenticated.");
        }
    }
    ```

    > [!NOTE]
    > 或者，如果你更喜欢全局强制执行令牌认证，你可以配置 ASP.NET Core
    > 认证堆栈使用 `OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme` 作为默认方案：
    >
    > ```csharp
    > services.AddAuthentication(options =>
    > {
    >     options.DefaultScheme = OpenIddictValidationAspNetCoreDefaults.AuthenticationScheme;
    > });
    > ```
    >
    > 注意：在配置为同时支持 cookie 和令牌认证的应用程序中不推荐使用此方法。

> [!TIP]
> 推荐阅读：[创建你自己的服务器实例](creating-your-own-server-instance.md)。
