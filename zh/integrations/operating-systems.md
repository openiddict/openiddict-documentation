# 操作系统集成 <Badge type="warning" text="client" />

为了与桌面和移动操作系统集成，OpenIddict 客户端提供了一个专门的包 [`OpenIddict.Client.SystemIntegration`](https://www.nuget.org/packages/OpenIddict.Client.SystemIntegration/)，它负责启动授权/登出流程并处理发送到 `redirect_uri` 或 `post_logout_redirect_uri` 的回调。

> [!IMPORTANT]
> `OpenIddict.Client.SystemIntegration` 利用 [.NET 通用主机](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host)来注册处理协议激活和管理嵌入式 Web 服务器生命周期所需的钩子。虽然某些应用程序模型（如 WPF 或 WinForms）提供了出色的 .NET 通用主机支持，但情况并非总是如此：在某些情况下，可能需要适配器。

> [!IMPORTANT]
> 本文档仅关注 OpenIddict 系统集成的配置，不涵盖使用 [.NET 通用主机](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host)所需的内容。有关如何配置它的更多信息，请参阅适用于您的应用程序模型的文档。

> [!TIP]
> 您可以在 [示例仓库](https://github.com/openiddict/openiddict-samples) 中找到使用 OpenIddict 客户端系统集成的示例：
>
> | 应用程序模型      | 支持的操作系统   |                                                                                                                                     |
> |------------------------|----------------|-------------------------------------------------------------------------------------------------------------------------------------|
> | Console                | Windows, Linux | [`Mimban.Client`](https://github.com/openiddict/openiddict-samples/tree/dev/samples/Mimban/Mimban.Client)                           |
> | WinForms               | Windows        | [`Sorgan.WinForms.Client`](https://github.com/openiddict/openiddict-samples/tree/dev/samples/Sorgan/Sorgan.WinForms.Client)         |
> | WPF                    | Windows        | [`Sorgan.Wpf.Client`](https://github.com/openiddict/openiddict-samples/tree/dev/samples/Sorgan/Sorgan.Wpf.Client)                   |
> | Blazor Hybrid (on WPF) | Windows        | [`Sorgan.BlazorHybrid.Client`](https://github.com/openiddict/openiddict-samples/tree/dev/samples/Sorgan/Sorgan.BlazorHybrid.Client) |

## 支持的平台

OpenIddict 6.0+ 支持以下操作系统：
  - Android 5.0+ (Android API 21+)
  - iOS 12.0+
  - Linux
  - macOS 10.15+
  - Mac Catalyst 13.1+
  - Windows 7 SP1

> [!IMPORTANT]
> `OpenIddict.Client.SystemIntegration` 包不依赖于特定的应用程序模型，设计用于大多数类型的应用程序。
> 
> 然而，有两个技术方面限制了可以使用 OpenIddict 客户端的情况：
>   - **.NET Standard 2.0 支持**：OpenIddict 依赖于需要 .NET Standard 2.0 支持的包（例如 `Microsoft.Extensions.*` 包），
>   这排除了所有运行在受限 .NET 版本上的应用程序，如 Windows 8 的通用应用或 Windows 10 1809 之前的 UWP 应用程序，
>   因为这些旧平台不公开 .NET Standard 2.0 中引入的任何 API。
> 
>   - **.NET 通用主机支持**：虽然 .NET 通用主机理论上可以在任何可以面向 .NET Standard 2.0 的应用程序中使用，但并非所有
>   应用程序模型都会提供完美的体验：
>     - Windows 和 Linux 的 .NET 控制台应用程序不需要任何特定内容，因为 .NET 通用主机已经内置了 `.UseConsoleLifetime()`
>     扩展，负责管理主机的生命周期（通常通过监听 `CTRL+C` 组合键和 `SIGTERM` 事件）。
> 
>     - WinForms 和 Windows Presentation Foundation 应用程序可以引用 
>     [Dapplo.Microsoft.Extensions.Hosting.WinForms](https://www.nuget.org/packages/Dapplo.Microsoft.Extensions.Hosting.WinForms/) 和
>     [Dapplo.Microsoft.Extensions.Hosting.Wpf](https://www.nuget.org/packages/Dapplo.Microsoft.Extensions.Hosting.Wpf/) 包
>     （由 [Robin Krom](https://github.com/Lakritzator) 开发）：结果既非常干净又完美集成。
> 
>     - 虽然目前没有 .NET 通用主机的 WinUI 3 应用程序配套包，
>     但 [Jöra Malek](https://github.com/AliveDevil) 提出的拉取请求应该会在未来解决这个问题：
>     [实现 WinUI](https://github.com/dapplo/Dapplo.Microsoft.Extensions.Hosting/pull/37)。
> 
>     - 目前没有 WinUI 2/UWP 应用程序的集成，这使得使用 .NET 通用主机更加复杂。
>     还有其他令人烦恼的限制，比如 Entity Framework Core 不完全支持 UWP。
> 
>     > [!WARNING]
>     > 由于微软停止了 UWP 平台的开发，在 UWP 应用程序中使用 OpenIddict 客户端
>     > 应该仅限于熟悉 UWP 及其固有限制的开发人员。
> 
>     - 虽然它有一个受 .NET 通用主机启发的应用程序构建器，但 MAUI 不支持任何 .NET 通用主机
>     抽象，如 `IHostedService` 或 `IHostApplicationLifetime`（这些是 OpenIddict 系统集成所需的）。
> 
>     > [!IMPORTANT]
>     > MAUI 团队[已经意识到这个限制](https://github.com/dotnet/maui/issues/2244)。在此期间，
>     > 可以通过使用 `IHostedService`/`IHostApplicationLifetime` 适配器来解决这个问题，如这个工程示例所示：
>     > [OpenIddict.Sandbox.Maui.Client](https://github.com/openiddict/openiddict-core/tree/dev/sandbox/OpenIddict.Sandbox.Maui.Client)。
> 
>     - 与 MAUI 类似，[Avalonia UI 不原生支持 .NET 通用主机](https://github.com/AvaloniaUI/Avalonia/issues/5241)，
>     但应该可以将其与常规的 Avalonia UI 主机模型一起使用。

### Android

OpenIddict Android 集成需要面向 `net8.0-android34.0`（或更高版本），但可以在任何运行在 Android 5.0+ (Android API 21) 上的应用程序中使用。

### iOS

OpenIddict iOS 集成需要面向 `net8.0-ios17.5`（或更高版本），但可以在任何运行在 iOS 12.0+ 上的应用程序中使用。

### Mac Catalyst

OpenIddict Mac Catalyst 集成需要面向 `net8.0-maccatalyst17.5`（或更高版本），但可以在任何运行在 Mac Catalyst 13.1+ 上的应用程序中使用。

### macOS

OpenIddict macOS 集成需要面向 `net8.0-macos14.5`（或更高版本），但可以在任何运行在 macOS 10.15+ 上的应用程序中使用。

### Windows

OpenIddict Windows 集成可以在任何运行在 Windows 7 SP1+ 上的应用程序中使用，并且与以下框架兼容：
  - `net461`（或更高版本）
  - `uap10.0.17763`（或更高版本）
  - `net6.0-windows7.0`（或更高版本）
  - `net6.0-windows10.0.17763`（或更高版本）

> [!IMPORTANT]
> 使用 OpenIddict 系统集成包与特定应用程序模型的能力取决于 .NET 运行时版本和 Windows 版本：
> 
> | Windows 版本 | .NET 运行时版本 | 控制台            | WinForms           | WPF                | WinUI 2   | WinUI 3   | MAUI      |
> |-----------------|----------------------|--------------------|--------------------|--------------------|-----------|-----------|-----------|
> | Windows 7 SP1   | .NET Framework 4.6.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 7 SP1   | .NET Framework 4.7.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 7 SP1   | .NET Framework 4.8   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 7 SP1   | .NET 6.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 7 SP1   | .NET 7.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 7 SP1   | .NET 8.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> |                 |                      |                    |                    |                    |           |           |           |
> | Windows 8.1     | .NET Framework 4.6.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET Framework 4.7.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET Framework 4.8   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET 6.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET 7.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET 8.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 8.1     | .NET Native/UAP      | :x:                | :x:                | :x:                | :x:       | :x:       | :x:       |
> |                 |                      |                    |                    |                    |           |           |           |
> | Windows 10 1507 | .NET Framework 4.6.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET Framework 4.7.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET Framework 4.8   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET 6.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET 7.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET 8.0             | :exclamation:      | :exclamation:      | :exclamation:      | :x:       | :x:       | :x:       |
> | Windows 10 1507 | .NET Native/UAP      | :x:                | :x:                | :x:                | :x:       | :x:       | :x:       |
> |                 |                      |                    |                    |                    |           |           |           |
> | Windows 10 1809 | .NET Framework 4.6.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 10 1809 | .NET Framework 4.7.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 10 1809 | .NET Framework 4.8   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 10 1809 | .NET 6.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 10 1809 | .NET 7.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 10 1809 | .NET 8.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 10 1809 | .NET Native/UAP      | :x:                | :x:                | :x:                | :warning: | :x:       | :x:       |
> |                 |                      |                    |                    |                    |           |           |           |
> | Windows 11 21H2 | .NET Framework 4.6.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 11 21H2 | .NET Framework 4.7.2 | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 11 21H2 | .NET Framework 4.8   | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :x:       |
> | Windows 11 21H2 | .NET 6.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 11 21H2 | .NET 7.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 11 21H2 | .NET 8.0             | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: | :x:       | :warning: | :warning: |
> | Windows 11 21H2 | .NET Native/UAP      | :x:                | :x:                | :x:                | :warning: | :x:       | :x:       |
> 
> > [!TIP]
> > WinRT 支持仅在面向 `net461`、`uap10.0.17763` 或 `net6.0-windows10.0.17763` 时提供：
> > `net6.0-windows7.0` 目标框架标记符不引用 WinRT API。
> 
> > [!WARNING]
> > 微软官方在 .NET 7.0 中停止了对 Windows 7 的支持。因此，仍需要在 Windows 7 上使用的应用程序
> > 应该可能停留在 .NET Framework 4.8（或 .NET 6.0，但应该注意它将在 2024 年 11 月达到 EoL）。

## 支持的交互方法

OpenIddict 客户端系统集成支持多种类型的交互方法来启动登录和登出请求：

### 系统浏览器

系统浏览器是 OpenIddict 在 Linux 和 Windows 上使用的默认交互方法：它是一个安全且方便的选择，原生
支持单点登录（SSO），因为授权服务器使用的身份验证 cookie 由浏览器本身持久化和管理。

> [!TIP]
> 使用系统浏览器时，配置的 `redirect_uri` 和 `post_logout_redirect_uri` 可以指向自定义 URI 方案
> （参见[由操作系统管理的协议激活](#由操作系统管理的协议激活)）
> 或嵌入式 Web 服务器（参见[嵌入式 Web 服务器](#嵌入式-web-服务器)）。

### Web 身份验证代理

虽然在大多数情况下不推荐，但在 UWP 上支持 [`WebAuthenticationBroker` API](https://learn.microsoft.com/en-us/windows/uwp/security/web-authentication-broker)。

> [!WARNING]
> `WebAuthenticationBroker` 仅在 WinUI 2.0/UWP 应用程序中受支持，不能在 WinUI 3.0 应用程序中使用。

### AS Web 身份验证会话

[`ASWebAuthenticationSession`](https://developer.apple.com/documentation/authenticationservices/aswebauthenticationsession) 在 iOS、
macOS 和 Mac Catalyst 上受支持，并且在这些平台上作为默认选项，因为它提供了出色的用户体验和优秀的安全级别。

> [!IMPORTANT]
> 使用 `ASWebAuthenticationSession` 时，配置的 `redirect_uri` 和 `post_logout_redirect_uri` 必须指向自定义 URI 方案。

### 自定义标签页意图

在 Android 上，OpenIddict 客户端系统集成支持
[`CustomTabsIntent` API](https://developer.android.com/reference/androidx/browser/customtabs/CustomTabsIntent) 来启动授权和登出请求
并将其作为默认选项使用，因为它既提供了良好的用户体验又提供了良好的安全级别。

> [!WARNING]
> 与 iOS 的 `ASWebAuthenticationSession` API 不同，使用 `CustomTabsIntent` 需要编写一个自定义活动
> 和一个包含用于应用程序处理回调请求的 URI 方案的意图过滤器。
>
> 以下是使用 MAUI 的 `IPlatformApplication` API 来解析 `OpenIddictClientSystemIntegrationService` 中介的示例：
> 
> ```csharp
> [Activity(NoHistory = true, LaunchMode = LaunchMode.SingleTop, Exported = true)]
> [IntentFilter([Intent.ActionView],
>     Categories = [Intent.CategoryDefault, Intent.CategoryBrowsable],
>     DataScheme = "com.openiddict.sandbox.maui.client")]
> public class CallbackActivity : Activity
> {
>     protected override async void OnCreate(Bundle? savedInstanceState)
>     {
>         base.OnCreate(savedInstanceState);
> 
>         if (Intent is not Intent intent)
>         {
>             return;
>         }
> 
>         var provider = IPlatformApplication.Current?.Services ??
>             throw new InvalidOperationException("The dependency injection container cannot be resolved.");
>         var service = provider.GetRequiredService<OpenIddictClientSystemIntegrationService>();
> 
>         try
>         {
>             await service.HandleCustomTabsIntentAsync(intent);
>         }
> 
>         finally
>         {
>             Finish();
>         }
>     }
> }
> ```

## 支持的回调方法

OpenIddict 客户端系统集成支持 2 种方法来处理不由 iOS 的 `ASWebAuthenticationSession`、UWP 的 `WebAuthenticationBroker` 或 Android 的 `CustomTabsIntent` 处理的登录后和登出后重定向回调：

### 由操作系统管理的协议激活

> [!TIP]
> 由操作系统管理的协议激活通常使用自定义 URI 方案（例如 `com.contoso.client:/cb?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz`）。

要使用操作系统管理的协议激活，必须至少向操作系统注册一个自定义 URI 方案：
  - 对于打包的 Windows 应用程序（例如 UWP 应用程序或打包的 WinForms/WPF/WinUI 3 应用程序），通常
  通过在应用程序清单中声明所需的 URI 方案来完成（例如 `<uap:Protocol Name="com.contoso.client"/>`）。

  > [!TIP]
  > 有关更多信息，请参阅
  > [处理 URI 激活](https://learn.microsoft.com/en-us/windows/uwp/launch-resume/handle-uri-activation#step-1-specify-the-extension-point-in-the-package-manifest)。

  - 对于非打包的 Windows 应用程序（例如传统的 Win32 WinForms/WPF 应用程序），通过为
  所需的 URI 方案添加指向将启动以处理协议激活的可执行文件的注册表项：
      - [全局地，在 `HKEY_CLASSES_ROOT` 下](https://stackoverflow.com/questions/80650/how-do-i-register-a-custom-url-protocol-in-windows)
      （由于需要管理员权限，这通常会在应用程序安装程序的安装阶段完成）。
      - [每个用户，在 `HKEY_CURRENT_USER\SOFTWARE\Classes` 下](https://stackoverflow.com/questions/60545581/oauth-2-0-authorization-for-windows-desktop-application-using-httplistener)。

  - 对于 Linux 应用程序，通过添加 `[Desktop Entry]`。有关更多信息，
  请参阅[创建自定义 URL 协议处理程序](https://unix.stackexchange.com/questions/497146/create-a-custom-url-protocol-handler)。

> [!TIP]
> 为了在多实例应用程序中透明地提取和处理协议激活，OpenIddict 实现了一个阻塞的 `IHostedService`，它确定
> 当前应用程序实例是否是为了响应协议激活而创建的（要么使用 WinRT
> [`AppInstance.GetActivatedEventArgs()` API](https://learn.microsoft.com/en-us/uwp/api/windows.applicationmodel.appinstance.getactivatedeventargs?view=winrt-22621)
> 要么通过从命令行参数中提取协议激活 URI）。
>
> 如果是这样，它会调用 OpenIddict 客户端管道来处理授权响应：
> 一旦响应被验证，它就会被重定向到正确的实例（其标识符存储在状态令牌中），并且当前实例被终止。

> [!TIP]
> 为了处理由其他实例重定向的授权响应，它还实现了一个后台 `IHostedService`，它
> 等待将进程间通知发布到命名管道。一旦授权响应被传输，它
> 被验证并且对 `AuthenticateInteractivelyAsync()` 的调用返回带有身份验证详细信息的最终响应。

### 嵌入式 Web 服务器

对于无法或不方便注册协议处理程序的情况，可以使用随 `OpenIddict.Client.SystemIntegration` 一起提供的嵌入式 HTTP Web 服务器：
当应用程序启动时，OpenIddict 会自动选择 `49152-65535` 范围内的第一个可用端口，并开始监听发送到 `localhost` 的回调 HTTP 请求
（很像 `OpenIddict.Client.AspNetCore` 或 `OpenIddict.Client.Owin` 的工作方式）。

> [!IMPORTANT]
> 使用嵌入式 Web 服务器处理回调请求时，`redirect_uri`/`post_logout_redirect_uri` 必须指向 `http://localhost/`：
> 如果远程授权服务器支持动态端口并且客户端应用程序被声明为本机应用程序，则不需要
> 指定端口：在这种情况下，OpenIddict 将在登录/登出请求发送到授权服务器之前将分配给嵌入式 Web 服务器的端口附加到 `redirect_uri`/`post_logout_redirect_uri` 参数。

## 基本配置

> [!IMPORTANT]
> 作为 OpenIddict 客户端的扩展，OpenIddict 系统集成需要一个正确配置的客户端。
>
> 有关如何开始使用 OpenIddict 客户端的更多信息，
> 请阅读[与远程服务器实例集成](/guides/getting-started/integrating-with-a-remote-server-instance.md)。

要配置操作系统集成，您需要：
  - **引用 `OpenIddict.Client.SystemIntegration` 包**：

  ```xml
  <PackageReference Include="OpenIddict.Client.SystemIntegration" Version="6.2.0" />
  ```

  - **在客户端选项中调用 `UseSystemIntegration()`**：

  ```csharp
  services.AddOpenIddict()
      .AddClient(options =>
      {
          // ...
  
          options.UseSystemIntegration();
      });
  ```

  - **检查您的 `redirect_uri`/`post_logout_redirect_uri`**：

  > [!IMPORTANT]
  > 默认情况下，OpenIddict 客户端系统集成使用 `http://localhost/` 作为基础 URI：这在 Linux 和 Windows 上使用
  > 嵌入式 Web 服务器与支持动态端口的远程授权服务器一起使用时效果很好，但在 iOS、macOS 和 Android 上，
  > 您需要使用自定义 URI 方案才能使用 `ASWebAuthenticationSession` 或 `CustomTabsIntent`：

  ```csharp
  services.AddOpenIddict()
      .AddClient(options =>
      {
          // ...

          // 添加与服务器项目中的客户端应用程序定义匹配的客户端注册。
          options.AddRegistration(new OpenIddictClientRegistration
          {
              Issuer = new Uri("https://localhost:44395/", UriKind.Absolute),
              ProviderName = "Local",

              ClientId = "maui",

              // 此示例使用带有自定义 URI 方案的协议激活来处理回调。
              //
              // 有关如何构造私有使用 URI 方案的更多信息，
              // 请阅读 https://www.rfc-editor.org/rfc/rfc8252#section-7.1 和
              // https://www.rfc-editor.org/rfc/rfc7595#section-3.8。
              PostLogoutRedirectUri = new Uri("com.openiddict.sandbox.maui.client:/callback/logout/local", UriKind.Absolute),
              RedirectUri = new Uri("com.openiddict.sandbox.maui.client:/callback/login/local", UriKind.Absolute),

              Scopes = { Scopes.Email, Scopes.Profile, Scopes.OfflineAccess, "demo_api" }
          });

          // 注册 Web 提供程序集成。
          //
          // 注意：为了减轻混合攻击，建议每个提供程序使用唯一的重定向端点
          // 地址，除非所有注册的提供程序都支持在授权响应中返回包含其 URL 的 "iss"
          // 参数。有关更多信息，
          // 请参阅 https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#section-4.4。
          options.UseWebProviders()
                 .AddTwitter(options =>
                 {
                     options.SetClientId("bXgwc0U3N3A3YWNuaWVsdlRmRWE6MTpjaQ")
                             // 注意：Twitter 不支持推荐的 ":/" 语法，需要使用 "://"。
                            .SetRedirectUri("com.openiddict.sandbox.maui.client://callback/login/twitter");
                 });
      });
  ```

配置完成后，您可以从依赖注入容器中解析 `OpenIddictClientService` 并使用
`ChallengeInteractivelyAsync()` 和 `AuthenticateInteractivelyAsync()` API 来启动交互式身份验证过程：

```csharp
try
{
    // 要求 OpenIddict 启动身份验证
    // 流程（通常，通过启动系统浏览器）。
    var result = await _service.ChallengeInteractivelyAsync(new()
    {
        ProviderName = provider
    });

    // 等待用户完成授权过程。
    var response = await _service.AuthenticateInteractivelyAsync(new()
    {
        Nonce = result.Nonce
    });

    MessageBox.Show($"欢迎，{response.Principal.FindFirst(ClaimTypes.Name)!.Value}。",
        "身份验证成功", MessageBoxButton.OK, MessageBoxImage.Information);
}

catch (ProtocolException exception) when (exception.Error is Errors.AccessDenied)
{
    MessageBox.Show("最终用户拒绝了授权。",
        "授权被拒绝", MessageBoxButtons.OK, MessageBoxIcon.Warning);
}
```

## 高级配置

### 非默认交互方法

OpenIddict 根据应用程序运行的操作系统自动选择要使用的最佳交互方法。

虽然使用默认方法被推荐，但可以强制 OpenIddict 使用特定方法：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .UseSystemBrowser();
    });
```

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .UseASWebAuthenticationSession();
    });
```

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .UseCustomTabsIntent();
    });
```

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .UseWebAuthenticationBroker();
    });
```

> [!WARNING]
> 如果您选择的方法不受平台支持，OpenIddict 将抛出 `PlatformNotSupportedException`。

### 激活处理和重定向

在 Linux 和 Windows 上，OpenIddict 自动处理协议激活并将其重定向到正确的实例
（如果需要）。虽然不推荐，但此机制也可以在其他平台上显式启用：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .EnableActivationHandling()
               .EnableActivationRedirection();
    });
```

如果需要，可以在 Linux 和 Windows 上显式禁用协议激活处理和重定向：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .DisableActivationHandling()
               .DisableActivationRedirection();
    });
```

### 管道选项和安全性

协议激活的重定向使用命名管道。可以使用 `SetPipeName()`、`SetPipeOptions()` 和 `SetPipeSecurity()` API 覆盖
应用于创建的管道服务器和客户端的默认选项和 ACL：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .SetPipeName("PIPE_NAME")
               .SetPipeOptions(...)
               .SetPipeSecurity(...);
    });
```

> [!TIP]
> Windows 上的默认管道 ACL 允许非提升进程和在同一用户帐户下运行的提升进程之间进行通信。
> 如果默认策略不合适，您可以使用 `SetPipeSecurity()` API 覆盖它。

### 嵌入式 Web 服务器处理 HTTP 请求

在 Linux 和 Windows 上，OpenIddict 自动启动嵌入式 HTTP 服务器来处理指向 `localhost` 的回调。
虽然不推荐，但此机制也可以在其他平台上显式启用：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .EnableEmbeddedWebServer();
    });
```

如果需要，可以在 Linux 和 Windows 上显式禁用嵌入式 Web 服务器：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .DisableEmbeddedWebServer();
    });
```

如果远程授权服务器不支持本机应用程序或不允许使用动态端口，
您还可以指定 OpenIddict 在启动嵌入式 Web 服务器时将尝试使用的有序端口列表：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseSystemIntegration()
               .SetAllowedEmbeddedWebServerPorts(17812, 17813, 17814);
    });
```
