# 贡献新的 Web 提供商 <Badge type="warning" text="client" />

> [!IMPORTANT]
> 本页面重点介绍如何实现 OpenIddict 尚未支持的新 Web 提供商。有关如何使用现有提供商的信息，请阅读 [Web 提供商](/integrations/web-providers.md)。

作为 OpenIddict 4.0 工作的一部分，[OpenIddict 添加了新的客户端堆栈](https://kevinchalet.com/2022/02/25/introducing-the-openiddict-client/)。
为了简化与提供 OAuth 2.0 和 OpenID Connect 服务的社交和企业提供商的集成，客户端堆栈中添加了一个配套包
（名为 `OpenIddict.Client.WebIntegration`）。虽然它与[现有的 aspnet-contrib OAuth 2.0 提供商](https://github.com/aspnet-contrib/AspNet.Security.OAuth.Providers/issues)有一些相似之处，**但实际上存在重要的技术差异**：

  - 与 aspnet-contrib 提供商使用的 ASP.NET Core OAuth 2.0 基础处理程序不同，**OpenIddict 客户端是一个双协议 OAuth 2.0 + OpenID Connect 堆栈**，
这意味着它可以同时支持这两种协议*同时*强制执行这些协议所需的所有安全检查。

  - 虽然 aspnet-contrib 提供商只能在 ASP.NET Core 上工作，**但 OpenIddict 提供商不仅可以在 ASP.NET Core 和 OWIN/ASP.NET 4.x
  应用程序中使用，还可以在 Android、iOS、Linux、macOS、Windows 和 Linux 应用程序中使用**，无需任何平台特定代码。

  - 与 aspnet-contrib 提供商不同，**OpenIddict Web 提供商所需的源代码是动态生成的**，使用
[Roslyn 源代码生成器](https://docs.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/source-generators-overview)和
[包含所有支持的提供商的 XML 文件](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationProviders.xml)
以及正确生成它们所需的配置。通过消除所有管道代码，OpenIddict Web 提供商更容易维护和更新。

  - 为了保证互操作性并做出最佳安全选择，**OpenIddict 客户端严重依赖服务器配置元数据**，这与
ASP.NET Core OAuth 2.0 基础处理程序使用的方法不同，后者不支持 OpenID Connect 发现和 OAuth 2.0 授权服务器元数据规范。

由于这些差异，**向 OpenIddict 堆栈贡献新提供商与添加 aspnet-contrib 提供商有很大不同**。

## 为新提供商添加新的 `<Provider>` 节点

要添加新的 OpenIddict Web 提供商，**第一步是在 [OpenIddictClientWebIntegrationProviders.xml](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationProviders.xml) 文件中添加一个新的 `<Provider>` 节点**。例如：

```xml
<Provider Name="Zendesk" Id="89fdfe22-c796-4227-a44a-d9cd3c467bbb"
          Documentation="https://developer.zendesk.com/documentation/live-chat/getting-started/auth/">
</Provider>
```

如果有官方文档，必须添加链接。如果有多种语言可用，应使用以下顺序：
  - 英语
  - 法语
  - 西班牙语
  - 任何其他语言

> [!WARNING]
> 添加的提供商必须按字母顺序放置在 XML 文件中。

## 为每个支持的环境添加 `<Environment>` 节点

**第二步是确定服务是否提供多个环境**（例如生产、测试或开发）。

  - 如果提供商支持多个环境，必须在 `<Provider>` 下添加多个 `<Environment>` 节点 - 每个环境一个：

  ```xml
  <Provider Name="Salesforce" Id="ce5bc4bc-6133-4e87-85ad-626b3c0a4427">
    <Environment Name="Production" />

    <Environment Name="Development" />
  </Provider>
  ```

> [!WARNING]
> 指定多个环境时，生产环境必须始终排在第一位。

  - 如果提供商不支持多个环境，必须添加单个 `<Environment>`（应省略 `Name` 属性）：

  ```xml
  <Provider Name="Google" Id="e0e90ce7-adb5-4b05-9f54-594941e5d960">
    <Environment />
  </Provider>
  ```

## 为每个环境添加适当的配置

**第三步是最复杂的：为每个添加的环境添加适当的配置**。

为此，您必须首先确定环境是否支持 OpenID Connect 发现或 OAuth 2.0 授权服务器元数据。
在某些情况下，此信息会在官方文档中提到，但并非总是如此。按照惯例，服务器元数据
通常从 `https://base address/.well-known/openid-configuration` 提供：如果您从此端点获得有效的 JSON 文档，则服务器
支持 OpenID Connect/OAuth 2.0 服务器元数据。

### 服务器提供配置端点

当服务器支持 OpenID Connect/OAuth 2.0 服务器元数据规范时，向 `<Environment>` 添加 `Issuer` 属性
对应于提供商地址，不带 `/.well-known/openid-configuration` 部分。例如，Google 将其发现文档
暴露在 `https://accounts.google.com/.well-known/openid-configuration`，因此要使用的正确颁发者是 `https://accounts.google.com/`：

```xml
<Provider Name="Google" Id="e0e90ce7-adb5-4b05-9f54-594941e5d960">
  <Environment Issuer="https://accounts.google.com/" />
</Provider>
```

不幸的是，提供商暴露其服务器元数据这一简单事实并不能保证返回的信息是完整或有效的。
因此，必须仔细审查服务器元数据，以确保配置可以被 OpenIddict 直接使用。特别是，
必须检查以下几点：

 - 返回的 `issuer` 节点与用于访问 `/.well-known/openid-configuration` 文档的基本地址匹配。如果不匹配，使用
 返回的 `issuer` 作为 `Issuer` 属性，并指定包含服务器元数据位置的 `ConfigurationEndpoint` 属性：

  ```xml
  <Provider Name="OrangeFrance" DisplayName="Orange France" Id="848d89f4-70e2-4a43-a6e1-d15a0fbedfff"
            Documentation="https://developer.orange.com/apis/authentication-fr/getting-started">
    <Environment Issuer="https://openid.orange.fr/"
                 ConfigurationEndpoint="https://api.orange.com/openidconnect/fr/v1/.well-known/openid-configuration" />
  </Provider>
  ```

  - 返回的 `grant_types_supported` 节点包含授权服务器正式支持的所有授权类型。
  如果不包含**且服务器支持授权代码流和至少另一个授权（例如 `refresh_token`）**，
  将需要在运行时修改动态配置。为此，更新
[OpenIddictClientWebIntegrationHandlers.Discovery.cs](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationHandlers.Discovery.cs) 中的 `AmendGrantTypes` 事件处理程序：

  ```csharp
  /// <summary>
  /// 包含负责为需要它的提供商修改支持的授权类型的逻辑。
  /// </summary>
  public sealed class AmendGrantTypes : IOpenIddictClientHandler<HandleConfigurationResponseContext>
  {
      /// <summary>
      /// 获取分配给此处理程序的默认描述符定义。
      /// </summary>
      public static OpenIddictClientHandlerDescriptor Descriptor { get; }
          = OpenIddictClientHandlerDescriptor.CreateBuilder<HandleConfigurationResponseContext>()
              .UseSingletonHandler<AmendGrantTypes>()
              .SetOrder(ExtractGrantTypes.Descriptor.Order + 500)
              .SetType(OpenIddictClientHandlerType.BuiltIn)
              .Build();

      /// <inheritdoc/>
      public ValueTask HandleAsync(HandleConfigurationResponseContext context)
      {
          if (context is null)
          {
              throw new ArgumentNullException(nameof(context));
          }

          // 注意：一些提供商不列出它们支持的授权类型，这会阻止 OpenIddict
          // 客户端使用它们（除非它们被假定为默认启用，如
          // 授权代码或隐式流）。为了解决这个问题，支持的授权类型列表
          // 被修改为包含需要它的提供商已知支持的类型。

          if (context.Registration.ProviderType is
              ProviderTypes.Apple or ProviderTypes.LinkedIn or ProviderTypes.QuickBooksOnline)
          {
              context.Configuration.GrantTypesSupported.Add(GrantTypes.AuthorizationCode);
              context.Configuration.GrantTypesSupported.Add(GrantTypes.RefreshToken);
          }

          return default;
      }
  }
  ```

  - 如果提供商已知支持 OpenID Connect，返回的 `scopes_supported` 包含 `openid` 值。如果不包含此
  特殊范围，将需要在运行时修改动态配置。为此，更新
[OpenIddictClientWebIntegrationHandlers.Discovery.cs](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationHandlers.Discovery.cs) 中的 `AmendScopes` 事件处理程序：

  ```csharp
  /// <summary>
  /// 包含负责为需要它的提供商修改支持的范围的逻辑。
  /// </summary>
  public sealed class AmendScopes : IOpenIddictClientHandler<HandleConfigurationResponseContext>
  {
      /// <summary>
      /// 获取分配给此处理程序的默认描述符定义。
      /// </summary>
      public static OpenIddictClientHandlerDescriptor Descriptor { get; }
          = OpenIddictClientHandlerDescriptor.CreateBuilder<HandleConfigurationResponseContext>()
              .UseSingletonHandler<AmendScopes>()
              .SetOrder(ExtractScopes.Descriptor.Order + 500)
              .SetType(OpenIddictClientHandlerType.BuiltIn)
              .Build();

      /// <inheritdoc/>
      public ValueTask HandleAsync(HandleConfigurationResponseContext context)
      {
          if (context is null)
          {
              throw new ArgumentNullException(nameof(context));
          }

          // 虽然这是一个推荐的节点，但一些提供商在其配置中不包含 "scopes_supported"，
          // 因此被 OpenIddict 客户端视为仅 OAuth 2.0 提供商。
          // 为了避免这种情况，手动添加 "openid" 范围以指示支持 OpenID Connect。
          if (context.Registration.ProviderType is ProviderTypes.EpicGames or ProviderTypes.Xero)
          {
              context.Configuration.ScopesSupported.Add(Scopes.OpenId);
          }

          return default;
      }
  }
  ```

### 服务器不提供配置端点

当服务器不支持 OpenID Connect/OAuth 2.0 服务器元数据规范时，添加 `Issuer` 属性（对应于
文档中给出的值或服务器的基本地址）**和**带有 OpenIddict 客户端与远程授权服务器通信所需的静态配置的 `<Configuration>` 节点。例如：

```xml
<Provider Name="Reddit" Id="01ae8033-935c-43b9-8568-eaf4d08c0613">
  <Environment Issuer="https://www.reddit.com/">
    <Configuration AuthorizationEndpoint="https://www.reddit.com/api/v1/authorize"
                   TokenEndpoint="https://www.reddit.com/api/v1/access_token"
                   UserinfoEndpoint="https://oauth.reddit.com/api/v1/me">
      <GrantType Value="authorization_code" />
      <GrantType Value="refresh_token" />
    </Configuration>
  </Environment>
</Provider>
```

当提供商仅支持授权代码流（通常带有不过期的访问令牌）时，为了清晰起见，应删除 `<GrantType>` 节点，
因为如果没有 `<GrantType>`，授权代码流始终被视为默认支持：

```xml
<Provider Name="Reddit" Id="01ae8033-935c-43b9-8568-eaf4d08c0613">
  <Environment Issuer="https://www.reddit.com/">
    <Configuration AuthorizationEndpoint="https://www.reddit.com/api/v1/authorize"
                   TokenEndpoint="https://www.reddit.com/api/v1/access_token"
                   UserinfoEndpoint="https://oauth.reddit.com/api/v1/me" />
  </Environment>
</Provider>
```

当提供商已知支持代码交换证明密钥 (PKCE) 时，必须在 `<Configuration>` 下添加 `<CodeChallengeMethod>` 节点
以确保 OpenIddict 客户端将发送适当的 `code_challenge`/`code_challenge_method` 参数：

```xml
<Provider Name="Fitbit" Id="10a558b9-8c81-47cc-8941-e54d0432fd51">
  <Environment Issuer="https://www.fitbit.com/">
    <Configuration AuthorizationEndpoint="https://www.fitbit.com/oauth2/authorize"
                   TokenEndpoint="https://api.fitbit.com/oauth2/token"
                   UserinfoEndpoint="https://api.fitbit.com/1/user/-/profile.json">
      <CodeChallengeMethod Value="S256" />
    </Configuration>
  </Environment>
</Provider>
```

> [!NOTE]
> 一些提供商使用多租户配置，该配置依赖于子域、自定义域或虚拟路径来区分租户实例。
> 如果要支持的提供商需要在其中一个 URI 中添加动态部分，必须在 `<Provider>` 下添加 `<Setting>` 节点以
> 存储租户名称。添加后，URI 可以包含指向所需设置属性的占位符：
>
> ```xml
> <Provider Name="Zendesk" Id="89fdfe22-c796-4227-a44a-d9cd3c467bbb">
>   <!--
>     注意：Zendesk 是一个多租户提供商，它依赖于子域来识别实例。
>     因此，以下 URI 都包含一个 {settings.Tenant} 占位符，该占位符将
>     在运行时被 OpenIddict 替换为 Zendesk 设置中配置的租户。
>   -->
> 
>   <Environment Issuer="https://{settings.Tenant}.zendesk.com/">
>     <Configuration AuthorizationEndpoint="https://{settings.Tenant}.zendesk.com/oauth/authorizations/new"
>                    TokenEndpoint="https://{settings.Tenant}.zendesk.com/oauth/tokens"
>                    UserinfoEndpoint="https://{settings.Tenant}.zendesk.com/api/v2/users/me" />
>   </Environment>
> 
>   <Setting PropertyName="Tenant" ParameterName="tenant" Type="String" Required="true"
>            Description="用于识别 Zendesk 实例的租户" />
> </Provider>
> ```

## 必要时解包用户信息响应

如果提供商返回包装或嵌套的用户信息响应（例如在 `response` 或 `data` 节点下），必须更新
[OpenIddictClientWebIntegrationHandlers.Userinfo.cs](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationHandlers.Userinfo.cs)
中的 `UnwrapUserinfoResponse` 处理程序以解包用户信息有效负载并允许 OpenIddict 将它们映射到平面 CLR `Claim` 实例：

```csharp
/// <summary>
/// 包含负责从嵌套 JSON 节点（例如 "data"）中提取用户信息响应的逻辑，
/// 用于需要它的提供商。
/// </summary>
public sealed class UnwrapUserinfoResponse : IOpenIddictClientHandler<ExtractUserinfoResponseContext>
{
    /// <summary>
    /// 获取分配给此处理程序的默认描述符定义。
    /// </summary>
    public static OpenIddictClientHandlerDescriptor Descriptor { get; }
        = OpenIddictClientHandlerDescriptor.CreateBuilder<ExtractUserinfoResponseContext>()
            .UseSingletonHandler<UnwrapUserinfoResponse>()
            .SetOrder(int.MaxValue - 50_000)
            .SetType(OpenIddictClientHandlerType.BuiltIn)
            .Build();

    /// <inheritdoc/>
    public ValueTask HandleAsync(ExtractUserinfoResponseContext context)
    {
        if (context is null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        context.Response = context.Registration.ProviderType switch
        {
            // Fitbit 返回嵌套的 "user" 对象。
            ProviderTypes.Fitbit => new(context.Response["user"]?.GetNamedParameters() ??
                throw new InvalidOperationException(SR.FormatID0334("user"))),

            // StackExchange 返回包含单个元素的 "items" 数组。
            ProviderTypes.StackExchange => new(context.Response["items"]?[0]?.GetNamedParameters() ??
                throw new InvalidOperationException(SR.FormatID0334("items/0"))),

            // SubscribeStar 返回嵌套在 GraphQL "data" 节点中的嵌套 "user" 对象。
            ProviderTypes.SubscribeStar => new(context.Response["data"]?["user"]?.GetNamedParameters() ??
                throw new InvalidOperationException(SR.FormatID0334("data/user"))),

            _ => context.Response
        };

        return default;
    }
}
```

> [!NOTE]
> 如果您不确定提供商是否返回包装的响应，可以在成功授权流程后在日志中找到
> 接收到的有效负载：
>
> ```
> OpenIddict.Client.OpenIddictClientDispatcher: Information: 从 https://contoso.com/users/me 返回的用户信息响应已成功提取：{
>   "data": {
>     "username": "odile.donat",
>     "name": "Odile Donat",
>     "email": "odile.donat@fabrikam.com"
>   }
> }.
> ```

## 如果提供商不支持标准 OpenID Connect 用户信息，将提供商特定的声明映射到其 `ClaimTypes` 等效项

如果提供商不返回 `id_token` 且不提供标准用户信息端点，它很可能使用自定义参数
来表示用户标识符等内容。如果是这样，更新
[OpenIddictClientWebIntegrationHandlers.cs](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationHandlers.cs)
中的 `MapCustomWebServicesFederationClaims` 事件处理程序，将这些参数映射到 .NET BCL `ClaimTypes` 类公开的常用 WS-Federation 声明，这简化了与 ASP.NET Core Identity 等库的集成：

```csharp
/// <summary>
/// 包含负责将选定的自定义声明映射到
/// 需要它的提供商的 WS-Federation 等效项的逻辑。
/// </summary>
public sealed class MapCustomWebServicesFederationClaims : IOpenIddictClientHandler<ProcessAuthenticationContext>
{
    /// <summary>
    /// 获取分配给此处理程序的默认描述符定义。
    /// </summary>
    public static OpenIddictClientHandlerDescriptor Descriptor { get; }
        = OpenIddictClientHandlerDescriptor.CreateBuilder<ProcessAuthenticationContext>()
            .AddFilter<RequireWebServicesFederationClaimMappingEnabled>()
            .UseSingletonHandler<MapCustomWebServicesFederationClaims>()
            .SetOrder(MapStandardWebServicesFederationClaims.Descriptor.Order + 1_000)
            .SetType(OpenIddictClientHandlerType.BuiltIn)
            .Build();

    /// <inheritdoc/>
    public ValueTask HandleAsync(ProcessAuthenticationContext context)
    {
        if (context is null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        context.MergedPrincipal.SetClaim(ClaimTypes.Email, context.Registration.ProviderType switch
        {
            // ServiceChannel 将用户标识符作为自定义 "Email" 节点返回：
            ProviderTypes.ServiceChannel => (string?) context.UserinfoResponse?["Email"],

            _ => context.MergedPrincipal.GetClaim(ClaimTypes.Email)
        });

        context.MergedPrincipal.SetClaim(ClaimTypes.Name, context.Registration.ProviderType switch
        {
            // ServiceChannel 将用户标识符作为自定义 "UserName" 节点返回：
            ProviderTypes.ServiceChannel => (string?) context.UserinfoResponse?["UserName"],

            _ => context.MergedPrincipal.GetClaim(ClaimTypes.Name)
        });

        context.MergedPrincipal.SetClaim(ClaimTypes.NameIdentifier, context.Registration.ProviderType switch
        {
            // ServiceChannel 将用户标识符作为自定义 "UserId" 节点返回：
            ProviderTypes.ServiceChannel => (string?) context.UserinfoResponse?["UserId"],

            _ => context.MergedPrincipal.GetClaim(ClaimTypes.NameIdentifier)
        });

        return default;
    }
}
```

## 测试生成的提供商

如果目标服务完全符合标准，此时不需要额外的配置。

要确认这一点，构建解决方案并将新提供商的客户端注册添加到其中一个沙盒项目：
  - 对于 `OpenIddict.Sandbox.Console.Client`（推荐选项），在 `Program.cs` 中。
  - 对于 `OpenIddict.Sandbox.AspNet.Client`（ASP.NET 4.8）或 `OpenIddict.Sandbox.AspNetCore.Client`（ASP.NET Core），在 `Startup.cs` 中。

```csharp
// 注册 Web 提供商集成。
//
// 注意：为了减轻混合攻击，建议为每个提供商使用唯一的重定向端点
// URI，除非所有注册的提供商都支持在授权响应中返回特殊的 "iss"
// 参数，其中包含它们的 URL。有关更多信息，请参阅
// https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#section-4.4。
options.UseWebProviders()
       // ... 其他提供商...
       .Add[provider name](options =>
       {
           options.SetClientId("[client identifier]");
           options.SetClientSecret("[client secret]");
           options.SetRedirectUri("callback/login/[provider name]");

           // 注意：根据提供商，可能需要配置其他选项。
       });
```

配置完成后，启动身份验证流程以测试提供商集成是否按预期工作。

> [!NOTE]
> 除非您同意与 OpenIddict 开发人员共享您的沙盒凭据，否则对沙盒项目所做的更改
> 不需要提交并包含在您的拉取请求中。

## 必要时添加提供商正常工作所需的解决方法

如果在身份验证过程中发生错误，提供商可能需要一个或多个解决方法才能使集成正常工作：

  - 提供商可能要求使用基本身份验证（即 `client_secret_basic`）在 `Authorization` 标头中发送客户端凭据。
实现 OpenID Connect 发现或 OAuth 2.0 授权服务器元数据的提供商通常会返回它们支持的客户端身份验证方法。
如果提供商不暴露其元数据，必须使用一个或多个 `<TokenEndpointAuthMethod>` 手动将支持的方法添加到静态配置：

  ```xml
  <Provider Name="Twitter" Id="1fd20ab5-d3f2-40aa-8c91-094f71652c65">
    <Environment Issuer="https://twitter.com/">
      <Configuration AuthorizationEndpoint="https://twitter.com/i/oauth2/authorize"
                     TokenEndpoint="https://api.twitter.com/2/oauth2/token"
                     UserinfoEndpoint="https://api.twitter.com/2/users/me">
        <CodeChallengeMethod Value="S256" />

        <TokenEndpointAuthMethod Value="client_secret_basic" />
      </Configuration>
    </Environment>
  </Provider>
  ```

  - 提供商可能要求发送一个或多个默认或必需的范围。如果是这样，必须将默认/必需的范围添加到 `<Environment>` 节点：

  ```xml
  <Provider Name="Twitter" Id="1fd20ab5-d3f2-40aa-8c91-094f71652c65">
    <Environment Issuer="https://twitter.com/">
      <Configuration AuthorizationEndpoint="https://twitter.com/i/oauth2/authorize"
                     TokenEndpoint="https://api.twitter.com/2/oauth2/token"
                     UserinfoEndpoint="https://api.twitter.com/2/users/me">
        <CodeChallengeMethod Value="S256" />

        <TokenEndpointAuthMethod Value="client_secret_basic" />
      </Configuration>

      <!--
        注意：Twitter 需要请求 "tweet.read" 和 "users.read" 范围才能使
        用户信息端点正常工作。因此，这两个范围被标记为必需，
        以便即使用户未明确添加它们，它们也始终被发送。
      -->

      <Scope Name="tweet.read" Default="true" Required="true" />
      <Scope Name="users.read" Default="true" Required="true" />
    </Environment>
  </Provider>
  ```

  - 提供商可能要求使用与标准不同的分隔符发送范围。虽然 OAuth 2.0 规范要求使用空格分隔多个范围，但一些提供商要求使用不同的分隔符（通常是逗号）。如果要添加的提供商需要它，更新
[OpenIddictClientWebIntegrationHandlers.cs](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationHandlers.cs) 中的 `FormatNonStandardScopeParameter` 事件处理程序，以使用提供商要求的正确分隔符。

  ```csharp
  /// <summary>
  /// 包含负责覆盖标准 "scope"
  /// 参数的逻辑，用于已知使用非标准格式的提供商。
  /// </summary>
  public class FormatNonStandardScopeParameter : IOpenIddictClientHandler<ProcessChallengeContext>
  {
      /// <summary>
      /// 获取分配给此处理程序的默认描述符定义。
      /// </summary>
      public static OpenIddictClientHandlerDescriptor Descriptor { get; }
          = OpenIddictClientHandlerDescriptor.CreateBuilder<ProcessChallengeContext>()
              .AddFilter<RequireInteractiveGrantType>()
              .UseSingletonHandler<FormatNonStandardScopeParameter>()
              .SetOrder(AttachChallengeParameters.Descriptor.Order + 500)
              .SetType(OpenIddictClientHandlerType.BuiltIn)
              .Build();

      /// <inheritdoc/>
      public ValueTask HandleAsync(ProcessChallengeContext context)
      {
          if (context is null)
          {
              throw new ArgumentNullException(nameof(context));
          }

          context.Request.Scope = context.Registration.ProviderType switch
          {
              // 以下提供商已知使用逗号分隔的范围而不是
              // 标准格式（要求使用空格作为范围分隔符）：
              ProviderTypes.Deezer or ProviderTypes.Shopify or ProviderTypes.Strava
                  => string.Join(",", context.Scopes),

              // 以下提供商已知使用加号分隔的范围而不是
              // 标准格式（要求使用空格作为范围分隔符）：
              ProviderTypes.Trovo => string.Join("+", context.Scopes),

              _ => context.Request.Scope
          };

          return default;
      }
  }
  ```

> [!NOTE]
> 如果提供商仍然无法工作，不幸的是很可能需要更复杂的解决方法。
> 如果您不熟悉 OpenIddict 事件模型，请在
> [`openiddict-core`](https://github.com/openiddict/openiddict-core/issues) 存储库中打开一个工单以获取帮助。

## 添加 ASCII 艺术标题

为了使提供商在 XML 文件中更容易定位，必须在每个提供商定义之前添加一个包含提供商名称的 ASCII 艺术标题作为 XML 注释：

```xml
<!--
                                ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
                                ██ ▄▄▄ ██ ████ ▄▄▀██ ▄▄▀██ █▀▄██
                                ██▄▄▄▀▀██ ████ ▀▀ ██ █████ ▄▀███
                                ██ ▀▀▀ ██ ▀▀ █ ██ ██ ▀▀▄██ ██ ██
                                ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
-->

<Provider Name="Slack" Id="57c5ef63-1fbf-47d2-b4a3-432feae2eafc"
          Documentation="https://api.slack.com/authentication/sign-in-with-slack">
  <Environment Issuer="https://slack.com/" />

  <Setting PropertyName="Team" ParameterName="team" Type="String" Required="false"
           Description="The value used as the 'team' parameter (allowing to bypass the login screen if the user is already authenticated in the specified workspace)" />
</Provider>
```

ASCII 艺术标题可以使用在线 [TextFancy.com](https://textfancy.com/text-art/) 工具轻松生成，并选择 `Small Negative` 字体。

> [!WARNING]
> 使用 TextFancy 生成器时，**确保始终在提供商名称后添加一个空格**以确保正确呈现。

> [!NOTE]
> 粘贴到 XML 文件中后，**确保 ASCII 艺术标题相对于文件中已有的其他标题正确居中**。

## 向 `openiddict-core` 存储库发送拉取请求

一旦您能够确认您的提供商正常工作，您需要做的就是发送 PR，以便它可以被添加到
[`openiddict-core`](https://github.com/openiddict/openiddict-core/issues) 存储库
并作为下一次更新的一部分与已经支持的提供商一起发布。
