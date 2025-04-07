# ASP.NET Core 数据保护集成 <Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

OpenIddict 的客户端和服务器功能都可以配置为使用 [ASP.NET Core 数据保护](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/introduction)来创建不透明的二进制令牌，而不是 [JSON Web Tokens](https://datatracker.ietf.org/doc/html/rfc7519)。ASP.NET Core 数据保护使用自己的密钥环来加密和保护令牌，防止篡改，并且支持除身份令牌外的所有类型的令牌（身份令牌始终是 JWT 令牌）。

与 JWT 不同，ASP.NET Core 数据保护令牌仅支持对称加密，并依赖于 ASP.NET 团队创建的二进制格式，而不是像 JWT 这样的标准。虽然这阻止了在需要互操作性的场景中使用此类令牌，但选择 ASP.NET Core 数据保护而不是 JWT 实际上有一些优势：

  - ASP.NET Core 数据保护令牌不使用 JSON 表示，因此通常会更短一些。
  - ASP.NET Core 数据保护被设计为可以实现高吞吐量，因为它原生用于 ASP.NET Core 的身份验证 cookie、防伪令牌和会话 cookie。

> [!TIP]
> 尽管其名称如此，ASP.NET Core 数据保护并不局限于 ASP.NET Core，可以在任何 .NET Standard 2.0 兼容的应用程序中使用。

## 基本配置 <Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

要配置 ASP.NET Core 集成，您需要：
  - **引用 `OpenIddict.Client.DataProtection` 和/或 `OpenIddict.Server.DataProtection` 和/或 `OpenIddict.Validation.DataProtection` 包**
  （取决于您的项目中是否需要客户端和/或服务器和/或验证功能）：

  > [!IMPORTANT]
  > 这些包由 `OpenIddict.AspNetCore` 元包引用（因此在使用它时不需要显式引用），但它们不由 `OpenIddict.Owin` 元包引用：如果您想在传统的 ASP.NET 4.6.1+ 应用程序中使用 ASP.NET Core 数据保护，您需要手动引用 `OpenIddict.Client.DataProtection`、`OpenIddict.Server.DataProtection` 和 `OpenIddict.Validation.DataProtection` 包。

  - **为每个要使用 ASP.NET Core 数据保护的 OpenIddict 功能（客户端、服务器和验证）调用 `options.UseDataProtection()`**：
  ```csharp
  services.AddOpenIddict()
      .AddClient(options =>
      {
          options.UseDataProtection();
      })
      .AddServer(options =>
      {
          options.UseDataProtection();
      })
      .AddValidation(options =>
      {
          options.UseDataProtection();
      });
  ```

  > [!IMPORTANT]
  > 如果您决定对服务器堆栈生成的令牌使用 ASP.NET Core 数据保护，请确保您也在验证选项中启用 ASP.NET Core 数据保护集成（以便您的 API 可以正确验证访问令牌）。

> [!NOTE]
> 切换到 ASP.NET Core 数据保护令牌不会阻止在启用数据保护支持之前颁发的 JWT 令牌的验证：现有令牌仍然可以与新颁发的 ASP.NET Core 数据保护令牌一起使用，直到它们过期。
>
> 当发送包含 JWT 刷新令牌的刷新令牌请求时，应用程序将收到一个 ASP.NET Core 数据保护刷新令牌，并且之前的令牌将自动标记为已兑换。

> [!WARNING]
> 当授权服务器和 API/资源服务器不是同一个应用程序时，ASP.NET Core 数据保护必须配置为使用相同的应用程序名称并共享相同的密钥环，以允许 OpenIddict 验证处理程序读取位于另一个项目中的授权服务器生成的 ASP.NET Core 数据保护令牌。
>
> 有关更多信息，请阅读[配置 ASP.NET Core 数据保护](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/configuration/overview)。

## 高级配置

### 默认令牌格式 <Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

默认情况下，启用 ASP.NET Core 数据保护支持将自动将所有类型的令牌（除身份令牌外，身份令牌始终是 JWT 令牌）的令牌格式从 JWT 切换到数据保护。

OpenIddict/数据保护集成可以配置为在创建新令牌时优先使用 JWT，**这在仅对特定令牌类型使用 ASP.NET Core 数据保护格式时很有用**（例如，仅用于授权代码和刷新令牌，但不用于访问令牌）：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseDataProtection()
               .PreferDefaultStateTokenFormat();
    })
    .AddServer(options =>
    {
        options.UseDataProtection()
               .PreferDefaultAccessTokenFormat()
               .PreferDefaultAuthorizationCodeFormat()
               .PreferDefaultDeviceCodeFormat()
               .PreferDefaultRefreshTokenFormat()
               .PreferDefaultUserCodeFormat();
    });
```
