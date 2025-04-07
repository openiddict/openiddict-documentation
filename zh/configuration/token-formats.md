# 令牌格式 <Badge type="warning" text="client" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

> [!TIP]
> 在 OpenIddict 3.0+ 中，撤销令牌的功能不再与令牌格式相关，也不需要在服务器选项中启用引用令牌：
> 只要未在服务器选项中明确禁用令牌存储，常规 JWT 或 ASP.NET Core 数据保护令牌就可以被撤销。
>
> 有关引用令牌的更多信息，请阅读[令牌存储](token-storage.md)。

## JSON Web 令牌

OpenIddict 实现了 [JSON Web 令牌](https://datatracker.ietf.org/doc/html/rfc7519)、[JSON Web 签名](https://datatracker.ietf.org/doc/html/rfc7515)
和 [JSON Web 加密](https://datatracker.ietf.org/doc/html/rfc7516) 标准，并依赖
[Azure Active Directory IdentityModel Extensions for .NET 库](https://github.com/AzureAD/azure-activedirectory-identitymodel-extensions-for-dotnet/)
（由 Microsoft 开发和维护）来使用在服务器选项中注册的凭据生成签名和加密的令牌。

### JWT 令牌类型

为了防止令牌替换和混淆代理攻击，**OpenIddict 3.0+ 使用标准的 `typ` JWT 头部来传递实际的令牌类型**。
这种机制取代了在 OpenIddict 早期版本中用于相同目的的私有 `token_usage` 声明。

根据 [JSON Web 令牌 (JWT) OAuth 2.0 访问令牌配置文件规范](https://datatracker.ietf.org/doc/html/rfc9068) 的要求，
**OpenIddict 3.0+ 生成的访问令牌始终使用 `"typ": "at+jwt"` 头部**，而身份令牌为了向后兼容仍然使用 `"typ": "JWT"`。
其他类型的令牌（仅由 OpenIddict 自己的端点接受）使用以 `oi_` 为前缀的私有令牌类型。

### 禁用 JWT 访问令牌加密

默认情况下，**OpenIddict 服务器对所有支持的令牌类型都强制进行加密**。虽然出于安全原因，这种强制无法为授权码、
刷新令牌和设备码禁用，但在需要与第三方 API/资源服务器集成时，可以为访问令牌放宽此限制。
如果接收访问令牌的资源服务器不完全支持 JSON Web 加密，也可以禁用访问令牌加密。

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.DisableAccessTokenEncryption();
    });
```

## ASP.NET Core 数据保护

虽然 OpenIddict 使用 [JSON Web 令牌](https://datatracker.ietf.org/doc/html/rfc7519) 格式处理所有令牌，但它也可以选择性地
配置为使用 [ASP.NET Core 数据保护](https://docs.microsoft.com/en-us/aspnet/core/security/data-protection/introduction)
来创建不透明的二进制令牌，而不是 JWT 令牌。有关如何使用 ASP.NET Core 数据保护的更多信息，请阅读
[ASP.NET Core 数据保护集成](/integrations/aspnet-core-data-protection.md)。
