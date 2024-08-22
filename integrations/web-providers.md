# Web providers <Badge type="warning" text="client" />

> [!IMPORTANT]
> This page focuses on configuring the OpenIddict client to use an existing provider. For more information on how to contribute a new
> provider that is not yet supported by OpenIddict, read [Contributing a new Web provider](/guides/contributing-a-new-web-provider.md).

To simplify integrating with well-known OAuth 2.0 or OpenID Connect providers, the OpenIddict client ships with a companion
package named [`OpenIddict.Client.WebIntegration`](https://www.nuget.org/packages/OpenIddict.Client.WebIntegration)
that supports 90+ popular services like Amazon, Discord, GitHub, Microsoft or Sign in with Apple.

> [!TIP]
> The OpenIddict client and its web providers can be used independently of the OpenIddict server feature.

## Supported platforms

All the providers included in this package can be used in any web application – ASP.NET 4.6.1+ or ASP.NET Core 2.1+ – and any desktop
or mobile application targeting a platform supported by the OpenIddict client (including Android, iOS, Linux, macOS and Windows).

## Supported services

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
| Exact Online                         | https://support.exactonline.com/community/s/knowledge-base#All-All-DNO-Content-oauth-eol-oauth-dev-impleovervw      |
| Facebook                             | https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow                                     |
| FACEIT                               | https://developers.faceit.com/docs/auth/oauth2                                                                      |
| Fitbit                               | https://dev.fitbit.com/build/reference/web-api/developer-guide/authorization/                                       |
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
| Webex                                | https://developer.webex.com/docs/login-with-webex                                                                   |
| Weibo                                | https://open.weibo.com/wiki/%E6%8E%88%E6%9D%83%E6%9C%BA%E5%88%B6%E8%AF%B4%E6%98%8E                                  |
| Wikimedia                            | https://api.wikimedia.org/wiki/Authentication                                                                       |
| WordPress                            | https://developer.wordpress.com/docs/oauth2/                                                                        |
| World ID                             | https://docs.worldcoin.org/reference/sign-in                                                                        |
| Xero                                 | https://developer.xero.com/documentation/xero-app-store/app-partner-guides/sign-in/                                 |
| Yahoo                                | https://developer.yahoo.com/oauth2/guide/openid_connect/                                                            |
| Zoho                                 | https://www.zoho.com/accounts/protocol/oauth.html                                                                   |
| Zoom                                 | https://developers.zoom.us/docs/integrations/oauth/                                                                 |

## Differences with the aspnet-contrib social providers

While the OpenIddict Web providers share some similarities with the
[existing aspnet-contrib OAuth 2.0 providers](https://github.com/aspnet-contrib/AspNet.Security.OAuth.Providers/issues), **there are actually important technical differences**:

 - **OpenIddict fully supports OpenID Connect**, which allows enforcing additional security checks for providers that implement it.

 - The OpenIddict client is stateful and provides **built-in countermeasures against nonce/token replay attacks**.

 - While the aspnet-contrib providers only support the OAuth 2.0 code flow, **the OpenIddict providers support additional flows**, including the
   OpenID Connect hybrid flow, the OAuth 2.0 client credentials grant, the resource owner password credentials grant or the refresh token grant.

 - **The OpenIddict client supports OAuth 2.0 token introspection and OAuth 2.0 token revocation**.

 - **OpenIddict uses OAuth 2.0 and OpenID Connect server configuration discovery** to avoid hardcoding the endpoint
   URIs of a provider when possible, making the OpenIddict Web providers more robust and more future-proof.

 - While the aspnet-contrib providers require targeting the latest ASP.NET Core version, **the OpenIddict Web providers can be
   used in any supported version**. They can also be used in ASP.NET 4.6.1+ websites and Windows/Linux desktop applications.

 - **OpenIddict uses `Microsoft.Extensions.Http.Polly` (or `Microsoft.Extensions.Http.Resilience` on .NET 8+)
   to make backchannel HTTP communications less prone to transient network errors**.

As such, while the aspnet-contrib providers are still fully supported, **developers are encouraged to use the OpenIddict client for new applications**.

## Basic configuration

> [!IMPORTANT]
> Being an extension to the OpenIddict client, the OpenIddict Web integration requires a properly configured client.
>
> For more information on how to get started with the OpenIddict client,
> read [Integrating with a remote server instance](/guides/getting-started/integrating-with-a-remote-server-instance.md).

To configure the `System.Net.Http` integration, you'll need to:
  - **Reference the `OpenIddict.Client.WebIntegration` package**:

  ```xml
  <PackageReference Include="OpenIddict.Client.WebIntegration" Version="5.8.0" />
  ```

  - **Call `UseWebProviders()` in the client options**:

  ```csharp
  services.AddOpenIddict()
      .AddClient(options =>
      {
          // ...
  
          // Register the Web providers integrations.
          options.UseWebProviders();
      });
  ```

  - To add a provider instance, call the corresponding `Add[Provider name]()` method and configure the required settings:

  ```csharp
  services.AddOpenIddict()
      .AddClient(options =>
      {
          // Note: to mitigate mix-up attacks, it's recommended to use a unique redirection endpoint
          // URI per provider, unless all the registered providers support returning a special "iss"
          // parameter containing their URL as part of authorization responses. For more information,
          // see https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#section-4.4.
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
> Once enabled, authentication operations (e.g challenges) can be triggered using the default provider name assigned by OpenIddict:
>   - In an ASP.NET Core application, using the authentication APIs provided by ASP.NET Core:
>   ```csharp
>   [HttpPost("~/login"), ValidateAntiForgeryToken]
>   public async Task<ActionResult> LogInWithGitHub(string returnUrl)
>   {
>       var properties = new AuthenticationProperties
>       {
>           // Only allow local return URLs to prevent open redirect attacks.
>           RedirectUri = Url.IsLocalUrl(returnUrl) ? returnUrl : "/"
>       };
>   
>       // Ask the OpenIddict client middleware to redirect the user agent to GitHub.
>       return Challenge(properties, OpenIddictClientWebIntegrationConstants.Providers.GitHub);
>   }
>   ```
> 
>   - In a desktop or mobile application (e.g WPF), using the APIs exposed by `OpenIddictClientService`:
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
>           // Disable the login button to prevent concurrent authentication operations.
>           LoginButton.IsEnabled = false;
>   
>           try
>           {
>               using var source = new CancellationTokenSource(delay: TimeSpan.FromSeconds(90));
>   
>               try
>               {
>                   // Ask OpenIddict to initiate the authentication flow (typically, by starting the system browser).
>                   var result = await _service.ChallengeInteractivelyAsync(new()
>                   {
>                       CancellationToken = source.Token,
>                       ProviderName = OpenIddictClientWebIntegrationConstants.Providers.GitHub
>                   });
>   
>                   // Wait for the user to complete the authorization process.
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
>               // Re-enable the login button to allow starting a new authentication operation.
>               LoginButton.IsEnabled = true;
>           }
>       }
>   }
>   ```

## Advanced configuration

### Register multiple instances of the same provider

Registering multiple instances of the same provider is fully supported but requires specifying a different provider
name for each provider registration if you use the `ProviderName` property to trigger authentication operations.

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
        // Only allow local return URLs to prevent open redirect attacks.
        RedirectUri = Url.IsLocalUrl(returnUrl) ? returnUrl : "/"
    };

    // Ask the OpenIddict client middleware to redirect the
    // user agent to GitHub using the "Instance A" settings.
    return Challenge(properties, "GitHub-Instance-A");
}
```

> [!WARNING]
> While not strictly required, using a different `redirect_uri` per provider instance is strongly recommended to help mitigate mix-up attacks.

### Configure a different display name that will be visible by the users

When using in an ASP.NET Core application using ASP.NET Core Identity and its default UI, the login page automatically
lists the external providers configured in the application, including the OpenIddict Web providers.

While OpenIddict automatically assigns a default display name, that value can be overridden using the `SetProviderDisplayName()` API:

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
