# Token 存储 <Badge type="info" text="core" /><Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

为了跟踪其客户端和服务器功能产生的所有令牌，OpenIddict 在数据库中为每个生成的令牌创建一个令牌条目。
令牌条目包含元数据，如令牌的主题、颁发给它的应用程序的客户端标识符，以及其创建和过期日期。

默认情况下，令牌有效负载 – 使用
[Azure Active Directory IdentityModel Extensions for .NET library](https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/) 生成 JWT 令牌，或
[ASP.NET Core Data Protection](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/introduction) 生成数据保护令牌 – 永远不会存储在数据库中，
除了以下类型的令牌：
  - 客户端功能：状态令牌。
  - 服务器功能：授权码、设备码和用户码（专门用于设备码流程）。

这些令牌 – 称为引用令牌 – 不会原样返回给调用者：相反，它们的有效负载存储在数据库条目中，并返回一个加密安全的
256位随机标识符 – 称为引用标识符 – 作为 base64url 编码的字符串，作为客户端应用程序与 OpenIddict 的端点
或资源服务器（如果在服务器选项中启用了引用访问令牌）通信时使用的"最终"令牌。

> [!TIP]
> 在 OpenIddict 3.0+ 中，撤销令牌的能力与令牌格式无关，不需要启用引用令牌：
> 只要在服务器选项中没有明确禁用令牌存储，常规 JWT 或 ASP.NET Core 数据保护令牌就可以被撤销。

## 启用引用访问和/或刷新令牌 <Badge type="danger" text="server" />

对于希望返回更短的访问和/或刷新令牌，或需要处理可能阻止通过网络发送大型令牌的限制的开发者，
可以在服务器选项中手动启用引用访问和刷新令牌。

> [!CAUTION]
> 启用引用访问和/或刷新令牌支持时，强烈建议：
> - 对访问和刷新令牌使用 ASP.NET Core 数据保护格式，因为它们受益于额外的安全措施，可以防止它们在被从数据库窃取时被原样发送。
> 有关如何启用 ASP.NET Core 数据保护的更多信息，请阅读 [Token 格式](token-formats.md)。
> - 启用列加密/静态数据加密以保护令牌条目的 `Payload` 列。

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.UseReferenceAccessTokens()
               .UseReferenceRefreshTokens();
    });
```

## 在 API 级别启用令牌条目验证 <Badge type="tip" text="validation" />

**出于性能考虑，OpenIddict 默认不会在接收 API 请求时检查令牌条目的状态**：访问令牌被认为在过期之前都是有效的。
对于需要立即撤销访问令牌的场景，可以配置 OpenIddict 验证处理程序以对每个 API 请求强制执行令牌条目验证：

> [!NOTE]
> 启用令牌条目验证要求 OpenIddict 验证处理程序能够直接访问存储令牌的服务器数据库，这使其
> 更适合与授权服务器位于同一应用程序中的 API。对于外部应用程序，请考虑使用内省而不是本地验证。
>
> 在这两种情况下，都会产生额外的延迟 – 由额外的数据库请求和内省的 HTTP 调用导致。

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.EnableTokenEntryValidation();
    });
```

## 禁用令牌存储 <Badge type="danger" text="server" />

虽然强烈不推荐，但可以在服务器选项中禁用令牌存储：

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.DisableTokenStorage();
    });
```

> [!WARNING]
> 禁用令牌存储会阻止启用引用访问或刷新令牌支持，因为这需要在数据库中存储令牌。
