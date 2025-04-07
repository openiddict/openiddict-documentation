# Web 提供程序 <Badge type="warning" text="client" />

> [!IMPORTANT]
> 本页主要介绍如何配置 OpenIddict 客户端以使用现有提供程序。有关如何贡献 OpenIddict 尚未支持的新提供程序的更多信息，
> 请阅读[贡献新的 Web 提供程序](/guides/contributing-a-new-web-provider.md)。

为了简化与知名的 OAuth 2.0 或 OpenID Connect 提供程序的集成，OpenIddict 客户端附带了一个名为
[`OpenIddict.Client.WebIntegration`](https://www.nuget.org/packages/OpenIddict.Client.WebIntegration)
的配套包，该包支持 90 多个流行服务，如 Amazon、Discord、GitHub、Microsoft 或 Sign in with Apple。

> [!TIP]
> OpenIddict 客户端及其 Web 提供程序可以独立于 OpenIddict 服务器功能使用。

## 支持的平台

此包中包含的所有提供程序都可以在任何 Web 应用程序（ASP.NET 4.6.1+ 或 ASP.NET Core 2.1+）以及任何面向 OpenIddict 客户端支持的平台
（包括 Android、iOS、Linux、macOS 和 Windows）的桌面或移动应用程序中使用。

## 支持的服务

| Service                              | Documentation                                                                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Active Directory Federation Services | https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/overview/ad-fs-openid-connect-oauth-flows-scenarios |
| Adobe                                | https://developer.adobe.com/developer-console/docs/guides/authentication/UserAuthentication/                        |
| Airtable                             | https://airtable.com/developers/web/api/oauth-reference                                                             |
| Amazon                               | https://developer.amazon.com/docs/login-with-amazon/authorization-code-grant.html                                   |
| Amazon Cognito                       | https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-reference.html                                    |
| ArcGIS Online                        | https://developers.arcgis.com/documentation/mapping-apis-and-services/security/oauth-2.0/                           |
| Asana                                | https://developers.asana.com/docs/openid-connect                                                                    |
| Atlassian                            | https://developer.atlassian.com/cloud/jira/platform/oauth-2-3lo-apps/                                               |
| Auth0                                | https://auth0.com/docs                                                                                              |
| Autodesk                             | https://aps.autodesk.com/en/docs/oauth/v2/tutorials/get-3-legged-token-pkce/                                        |
| Basecamp                             | https://github.com/basecamp/api/blob/master/sections/authentication.md                                              |
| Battle.net                           | https://develop.battle.net/documentation/guides/using-oauth                                                         |
| Bitbucket                            | https://support.atlassian.com/bitbucket-cloud/docs/use-oauth-on-bitbucket-cloud/                                    |
| Bitly                                | https://dev.bitly.com/docs/getting-started/authentication/                                                          |
| Box                                  | https://developer.box.com/guides/authentication/oauth2/oauth2-setup/                                                |
| Calendly                             | https://developer.calendly.com/api-docs/b3A6NTkxNDA5-get-authorization-code                                         |
| ClassLink                            | https://help.classlink.com/s/topic/0TO1E0000009PVYWA2/api                                                           |
| Clever                               | https://dev.clever.com/docs/oauth-oidc-overview                                                                     |
| Dailymotion                          | https://developers.dailymotion.com/guides/platform-api-authentication/                                              |
| Deezer                               | https://developers.deezer.com/api/oauth                                                                             |
| DeviantArt                           | https://www.deviantart.com/developers/authentication                                                                |
| Discord                              | https://discord.com/developers/docs/topics/oauth2                                                                   |
| Disqus                               | https://disqus.com/api/docs/auth/                                                                                   |
| DocuSign                             | https://developers.docusign.com/platform/auth/authcode/authcode-get-token/                                          |
| Dropbox                              | https://developers.dropbox.com/oidc-guide                                                                           |
| Epic Games                           | https://dev.epicgames.com/docs/web-api-ref/authentication                                                           |
| EVE Online                           | https://docs.esi.evetech.net/docs/sso/sso_authorization_flow.html                                                   |
| Exact Online                         | https://support.exactonline.com/community/s/knowledge-base#All-All-DNO-Content-oauth-eol-oauth-dev-impleovervw      |
| Facebook                             | https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow                                     |
| FACEIT                               | https://developers.faceit.com/docs/auth/oauth2                                                                      |
| Fitbit                               | https://dev.fitbit.com/build/reference/web-api/developer-guide/authorization/                                       |
| GitCode                              | https://docs.gitcode.com/en/docs/oauth/                                                                             |
| Gitee                                | https://gitee.com/api/v5/oauth_doc#/                                                                                |
| GitHub                               | https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps                               |
| GitLab                               | https://docs.gitlab.com/ee/integration/openid_connect_provider.html                                                 |
| Google                               | https://developers.google.com/identity/protocols/oauth2/openid-connect                                              |
| Harvest                              | https://help.getharvest.com/api-v2/authentication-api/authentication/authentication/                                |
| Huawei                               | https://developer.huawei.com/consumer/en/doc/HMSCore-Guides/open-platform-oauth-0000001053629189                    |
| HubSpot                              | https://developers.hubspot.com/docs/api/oauth-quickstart-guide                                                      |
| JumpCloud                            | https://jumpcloud.com/support/sso-with-oidc                                                                         |
| Kakao                                | https://developers.kakao.com/docs/latest/en/kakaologin/rest-api                                                     |
| Keycloak                             | https://www.keycloak.org/getting-started/getting-started-docker                                                     |
| KOOK                                 | https://developer.kookapp.cn/doc/oauth2                                                                             |
| Kroger                               | https://developer.kroger.com/documentation/public/security/customer                                                 |
| Lark (Feishu)                        | https://open.larksuite.com/document/common-capabilities/sso/web-application-sso/web-app-overview?lang=en-US         |
| Lichess                              | https://lichess.org/api#tag/OAuth                                                                                   |
| LinkedIn                             | https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2                |
| Mailchimp                            | https://mailchimp.com/developer/marketing/guides/access-user-data-oauth-2/#oauth-2-workflow-overview                |
| Mastodon                             | https://docs.joinmastodon.org/spec/oauth/                                                                           |
| Meetup                               | https://www.meetup.com/api/authentication/#p01-using-oauth2-section                                                 |
| Microsoft Account/Entra ID           | https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-protocols-oidc                                   |
| Mixcloud                             | https://www.mixcloud.com/developers/#authorization                                                                  |
| MusicBrainz                          | https://musicbrainz.org/doc/Development/OAuth2                                                                      |
| Nextcloud                            | https://docs.nextcloud.com/server/latest/admin_manual/configuration_server/oauth2.html                              |
| Notion                               | https://developers.notion.com/docs/authorization                                                                    |
| Okta                                 | https://developer.okta.com/docs/reference/api/oidc/                                                                 |
| OpenStreetMap                        | https://wiki.openstreetmap.org/wiki/OAuth#OAuth_2.0                                                                 |
| Orange France                        | https://developer.orange.com/apis/authentication-fr/getting-started                                                 |
| Patreon                              | https://docs.patreon.com/#oauth                                                                                     |
| PayPal                               | https://developer.paypal.com/docs/log-in-with-paypal/                                                               |
| PingOne                              | https://docs.pingidentity.com/r/en-us/pingoneforenterprise/p14e_connect_oidc                                        |
| Pipedrive                            | https://pipedrive.readme.io/docs/marketplace-oauth-authorization                                                    |
| Pro Santé Connect                    | https://industriels.esante.gouv.fr/en/products-services/health-pro-authentication-pro-sante-connect                 |
| QuickBooks Online                    | https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/openid-connect         |
| Reddit                               | https://github.com/reddit-archive/reddit/wiki/OAuth2                                                                |
| Salesforce                           | https://help.salesforce.com/s/articleView?id=sf.connected_app_overview.htm                                          |
| ServiceChannel                       | https://developer.servicechannel.com/basics/general/authentication/                                                 |
| Shopify                              | https://shopify.dev/docs/apps/auth/oauth                                                                            |
| Sign in with Apple                   | https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api                            |
| Slack                                | https://api.slack.com/authentication/sign-in-with-slack                                                             |
| Smartsheet                           | https://smartsheet.redoc.ly/#section/OAuth-Walkthrough                                                              |
| Spotify                              | https://developer.spotify.com/documentation/general/guides/authorization/                                           |
| Stack Exchange                       | https://api.stackexchange.com/docs/authentication                                                                   |
| Strava                               | https://developers.strava.com/docs/authentication/                                                                  |
| Streamlabs                           | https://dev.streamlabs.com/docs/oauth-2                                                                             |
| Stripe Connect                       | https://stripe.com/docs/connect/oauth-reference                                                                     |
| SubscribeStar                        | https://www.subscribestar.com/api                                                                                   |
| SuperOffice                          | https://docs.superoffice.com/en/authentication/online/api.html                                                      |
| Tidal                                | https://developer.tidal.com/documentation/authorization/authorization-overview                                      |
| Todoist                              | https://developer.todoist.com/guides/#authorization                                                                 |
| Trakt                                | https://trakt.docs.apiary.io/#reference/authentication-oauth                                                        |
| Trovo                                | https://developer.trovo.live/docs/APIs.html#_3-authentication                                                       |
| Tumblr                               | https://www.tumblr.com/docs/en/api/v2#oauth2-authorization                                                          |
| Twitch                               | https://dev.twitch.tv/docs/authentication                                                                           |
| Twitter                              | https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code                                   |
| Typeform                             | https://www.typeform.com/developers/get-started/applications/                                                       |
| Verimi                               | https://docs.verimi.de/#/oidc/oidc_overview                                                                         |
| Vimeo                                | https://developer.vimeo.com/api/authentication                                                                      |
| VK ID                                | https://id.vk.com/about/business/go/docs/en/vkid/latest/oauth-vk                                                    |
| Webex                                | https://developer.webex.com/docs/login-with-webex                                                                   |
| Weibo                                | https://open.weibo.com/wiki/%E6%8E%88%E6%9D%83%E6%9C%BA%E5%88%B6%E8%AF%B4%E6%98%8E                                  |
| Wikimedia                            | https://api.wikimedia.org/wiki/Authentication                                                                       |
| WordPress                            | https://developer.wordpress.com/docs/oauth2/                                                                        |
| World ID                             | https://docs.worldcoin.org/reference/sign-in                                                                        |
| Xero                                 | https://developer.xero.com/documentation/xero-app-store/app-partner-guides/sign-in/                                 |
| Yahoo                                | https://developer.yahoo.com/oauth2/guide/openid_connect/                                                            |
| Yandex                               | https://yandex.ru/dev/id/doc/en/                                                                                    |
| Zendesk                              | https://support.zendesk.com/hc/en-us/articles/4408845965210-Using-OAuth-authentication-with-your-application        |
| Zoho                                 | https://www.zoho.com/accounts/protocol/oauth.html                                                                   |
| Zoom                                 | https://developers.zoom.us/docs/integrations/oauth/                                                                 |

## 与 aspnet-contrib 社交提供程序的区别

虽然 OpenIddict Web 提供程序与[现有的 aspnet-contrib OAuth 2.0 提供程序](https://github.com/aspnet-contrib/AspNet.Security.OAuth.Providers/issues)
有一些相似之处，但**实际上存在重要的技术差异**：

 - **OpenIddict 完全支持 OpenID Connect**，这允许对实现它的提供程序执行额外的安全检查。

 - OpenIddict 客户端是有状态的，并提供**针对 nonce/token 重放攻击的内置对策**。

 - 虽然 aspnet-contrib 提供程序仅支持 OAuth 2.0 授权码流程，但 **OpenIddict 提供程序支持其他流程**，包括
   OpenID Connect 混合流程、OAuth 2.0 客户端凭据授权、资源所有者密码凭据授权或刷新令牌授权。

 - **OpenIddict 客户端支持 OAuth 2.0 令牌自省和 OAuth 2.0 令牌撤销**。

 - **OpenIddict 使用 OAuth 2.0 和 OpenID Connect 服务器配置发现**，以尽可能避免硬编码提供程序的端点
   URI，使 OpenIddict Web 提供程序更加健壮和面向未来。

 - 虽然 aspnet-contrib 提供程序需要针对最新的 ASP.NET Core 版本，但 **OpenIddict Web 提供程序可以在
   任何支持的版本中使用**。它们也可以在 ASP.NET 4.6.1+ 网站和移动/桌面应用程序中使用。

 - **OpenIddict 使用 `Microsoft.Extensions.Http.Polly`（或在 .NET 8+ 上使用 `Microsoft.Extensions.Http.Resilience`）
   使后台通道 HTTP 通信不易受瞬时网络错误影响**。

因此，虽然 aspnet-contrib 提供程序仍然完全受支持，但**建议开发人员在新应用程序中使用 OpenIddict 客户端**。

## 基本配置

> [!IMPORTANT]
> 作为 OpenIddict 客户端的扩展，OpenIddict Web 集成需要正确配置的客户端。
>
> 有关如何开始使用 OpenIddict 客户端的更多信息，
> 请阅读[与远程服务器实例集成](/guides/getting-started/integrating-with-a-remote-server-instance.md)。

要配置 `System.Net.Http` 集成，您需要：
  - **引用 `OpenIddict.Client.WebIntegration` 包**：

  ```xml
  <PackageReference Include="OpenIddict.Client.WebIntegration" Version="6.2.0" />
  ```

  - **在客户端选项中调用 `UseWebProviders()`**：

  ```csharp
  services.AddOpenIddict()
      .AddClient(options =>
      {
          // ...
  
          // 注册 Web 提供程序集成。
          options.UseWebProviders();
      });
  ```

  - 要添加提供程序实例，调用相应的 `Add[Provider name]()` 方法并配置所需的设置：

  ```csharp
  services.AddOpenIddict()
      .AddClient(options =>
      {
          // 注意：为了减轻混合攻击，建议为每个提供程序使用唯一的重定向端点
          // URI，除非所有注册的提供程序都支持在授权响应中返回包含其 URL 的特殊 "iss"
          // 参数。更多信息，请参见 https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#section-4.4。
          options.UseWebProviders()
                 .AddGitHub(options =>
                 {
                     options.SetClientId("[client identifier]")
                            .SetClientSecret("[client secret]")
                            .SetRedirectUri("callback/login/github");
                 })
                 .AddTwitter(options =>
                 {
                     options.SetClientId("[client identifier]")
                            .SetClientSecret("[client secret]")
                            .SetRedirectUri("callback/login/twitter");
                 });
      });
  ```

> [!TIP]
> 启用后，可以使用 OpenIddict 分配的默认提供程序名称触发身份验证操作（例如挑战）：
>   - 在 ASP.NET Core 应用程序中，使用 ASP.NET Core 提供的身份验证 API：
>   ```csharp
>   [HttpPost("~/login"), ValidateAntiForgeryToken]
>   public async Task<ActionResult> LogInWithGitHub(string returnUrl)
>   {
>       var properties = new AuthenticationProperties
>       {
>           // 仅允许本地返回 URL 以防止开放重定向攻击。
>           RedirectUri = Url.IsLocalUrl(returnUrl) ? returnUrl : "/"
>       };
>   
>       // 要求 OpenIddict 客户端中间件将用户代理重定向到 GitHub。
>       return Challenge(properties, OpenIddictClientWebIntegrationConstants.Providers.GitHub);
>   }
>   ```
> 
>   - 在桌面或移动应用程序（例如 WPF）中，使用 `OpenIddictClientService` 公开的 API：
>   ```csharp
>   public partial class MainWindow : Window, IWpfShell
>   {
>       private readonly OpenIddictClientService _service;
>   
>       public MainWindow(OpenIddictClientService service)
>       {
>           _service = service ?? throw new ArgumentNullException(nameof(service));
>   
>           InitializeComponent();
>       }
>   
>       private async void LoginButton_Click(object sender, RoutedEventArgs e)
>       {
>           // 禁用登录按钮以防止并发身份验证操作。
>           LoginButton.IsEnabled = false;
>   
>           try
>           {
>               using var source = new CancellationTokenSource(delay: TimeSpan.FromSeconds(90));
>   
>               try
>               {
>                   // 要求 OpenIddict 启动身份验证流程（通常是通过启动系统浏览器）。
>                   var result = await _service.ChallengeInteractivelyAsync(new()
>                   {
>                       CancellationToken = source.Token,
>                       ProviderName = OpenIddictClientWebIntegrationConstants.Providers.GitHub
>                   });
>   
>                   // 等待用户完成授权过程。
>                   var principal = (await _service.AuthenticateInteractivelyAsync(new()
>                   {
>                       CancellationToken = source.Token,
>                       Nonce = result.Nonce
>                   })).Principal;
>   
>                   MessageBox.Show($"Welcome, {principal.FindFirst(ClaimTypes.Name)!.Value}.",
>                       "Authentication successful", MessageBoxButton.OK, MessageBoxImage.Information);
>               }
>   
>               catch (OperationCanceledException)
>               {
>                   MessageBox.Show("The authentication process was aborted.",
>                       "Authentication timed out", MessageBoxButton.OK, MessageBoxImage.Warning);
>               }
>   
>               catch (ProtocolException exception) when (exception.Error is Errors.AccessDenied)
>               {
>                   MessageBox.Show("The authorization was denied by the end user.",
>                       "Authorization denied", MessageBoxButton.OK, MessageBoxImage.Warning);
>               }
>   
>               catch
>               {
>                   MessageBox.Show("An error occurred while trying to authenticate the user.",
>                       "Authentication failed", MessageBoxButton.OK, MessageBoxImage.Error);
>               }
>           }
>   
>           finally
>           {
>               // 重新启用登录按钮以允许启动新的身份验证操作。
>               LoginButton.IsEnabled = true;
>           }
>       }
>   }
>   ```

## 高级配置

### 注册同一提供程序的多个实例

完全支持注册同一提供程序的多个实例，但如果使用 `ProviderName` 属性触发身份验证操作，则需要为每个提供程序注册指定不同的提供程序名称。

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseWebProviders()
               .AddGitHub(options =>
               {
                   options.SetClientId("[client identifier A]")
                          .SetClientSecret("[client secret A]")
                          .SetRedirectUri("callback/login/github/a")
                          .SetProviderName("GitHub-Instance-A");
               })
               .AddGitHub(options =>
               {
                   options.SetClientId("[client identifier B]")
                          .SetClientSecret("[client secret B]")
                          .SetRedirectUri("callback/login/github/b")
                          .SetProviderName("GitHub-Instance-B");
               });
    });
```

```csharp
[HttpPost("~/login"), ValidateAntiForgeryToken]
public async Task<ActionResult> LogInWithGitHubInstanceA(string returnUrl)
{
    var properties = new AuthenticationProperties
    {
        // 仅允许本地返回 URL 以防止开放重定向攻击。
        RedirectUri = Url.IsLocalUrl(returnUrl) ? returnUrl : "/"
    };

    // 要求 OpenIddict 客户端中间件使用"实例 A"设置
    // 将用户代理重定向到 GitHub。
    return Challenge(properties, "GitHub-Instance-A");
}
```

> [!WARNING]
> 虽然不是严格要求，但强烈建议为每个提供程序实例使用不同的 `redirect_uri` 以帮助减轻混合攻击。

### 配置用户可见的不同显示名称

当使用 ASP.NET Core Identity 及其默认 UI 时，登录页面会自动列出应用程序中配置的外部提供程序，包括 OpenIddict Web 提供程序。

虽然 OpenIddict 会自动分配默认显示名称，但可以使用 `SetProviderDisplayName()` API 覆盖该值：

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseWebProviders()
               .AddGitHub(options =>
               {
                   options.SetClientId("[client identifier]")
                          .SetClientSecret("[client secret]")
                          .SetRedirectUri("callback/login/github")
                          .SetProviderDisplayName("Log in with GitHub™️");
               });
    });
```
