# Contributing a new Web provider

> [!IMPORTANT]
> This page focuses on implementing a new Web provider that is not yet supported by OpenIddict. For more
> information on how to consume an existing provider, read [Web providers](/integrations/web-providers.md).

As part of the OpenIddict 4.0 effort, [a new client stack has been added to OpenIddict](https://kevinchalet.com/2022/02/25/introducing-the-openiddict-client/).
To simplify integrating with social and enterprise providers that offer OAuth 2.0 and OpenID Connect services, a companion package
(named `OpenIddict.Client.WebIntegration`) has been added to the client stack. While it shares some similarities with the
[existing aspnet-contrib OAuth 2.0 providers](https://github.com/aspnet-contrib/AspNet.Security.OAuth.Providers/issues), **there are actually important technical differences**:

  - Unlike the ASP.NET Core OAuth 2.0 base handler used by the aspnet-contrib providers, **the OpenIddict client is a dual-protocol OAuth 2.0 + OpenID Connect stack**,
which means it can support both protocols *while* enforcing all the security checks required by these protocols.

  - While the aspnet-contrib providers only work on ASP.NET Core, **the OpenIddict providers can not only be used in ASP.NET Core and OWIN/ASP.NET 4.x
  applications, but also in Android, iOS, Linux, macOS, Windows and Linux applications** without requiring any platform-specific code.

  - Unlike the aspnet-contrib providers, **the source code needed to materialize the OpenIddict Web providers is created dynamically** using
[Roslyn Source Generators](https://docs.microsoft.com/en-us/dotnet/csharp/roslyn-sdk/source-generators-overview) and
[a XML file that includes all the supported providers](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationProviders.xml)
with the configuration needed to properly generate them. By eliminating all the plumbing code, the OpenIddict Web providers are much easier to maintain and update.

  - To guarantee interoperability and make the best security choices, **the OpenIddict client heavily relies on server configuration metadata**, which differs from
the approach used by the ASP.NET Core OAuth 2.0 base handler, that doesn't support the OpenID Connect discovery and OAuth 2.0 authorization server metadata specifications.

Due to these differences, **contributing a new provider to the OpenIddict stack is quite different from adding an aspnet-contrib provider**.

## Add a new `<Provider>` node for the new provider

To add a new OpenIddict Web provider, **the first step is to add a new `<Provider>` node** to the [OpenIddictClientWebIntegrationProviders.xml](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationProviders.xml) file. For instance:

```xml
<Provider Name="Zendesk" Id="89fdfe22-c796-4227-a44a-d9cd3c467bbb"
          Documentation="https://developer.zendesk.com/documentation/live-chat/getting-started/auth/">
</Provider>
```

If available, a link to the official documentation MUST be added. If multiple languages are available, the following order SHOULD be used:
  - English
  - French
  - Spanish
  - Any other language

> [!WARNING]
> The added provider MUST be placed in the XML file such that the alphabetical order is respected.

## Add an `<Environment>` node per supported environment

**The second step is to determine whether the service offers multiple environments** (e.g Production, Testing or Development).

  - If the provider supports multiple environments, multiple `<Environment>` nodes - one per environment - MUST be added under `<Provider>`:

  ```xml
  <Provider Name="Salesforce" Id="ce5bc4bc-6133-4e87-85ad-626b3c0a4427">
    <Environment Name="Production" />

    <Environment Name="Development" />
  </Provider>
  ```

> [!WARNING]
> When specifying multiple environments, the production environment MUST always appear first.

  - If the provider doesn't support multiple environment, a single `<Environment>` MUST be added (the `Name` attribute SHOULD be omitted):

  ```xml
  <Provider Name="Google" Id="e0e90ce7-adb5-4b05-9f54-594941e5d960">
    <Environment />
  </Provider>
  ```

## Add the appropriate configuration for each environment

**The third step is the most complicated one: adding the appropriate configuration for each of the added environments**.

For that, you MUST first determine whether the environment supports OpenID Connect discovery or OAuth 2.0 authorization server metadata.
In some cases, this information will be mentioned in the official documentation, but it's not always true. By convention, the server metadata
is typically served from `https://base address/.well-known/openid-configuration`: if you get a valid JSON document from this endpoint, the server
supports OpenID Connect/OAuth 2.0 server metadata.

### The server provides a configuration endpoint

When the server supports the OpenID Connect/OAuth 2.0 server metadata specification(s), add an `Issuer` attribute to `<Environment>`
corresponding to the provider address without the `/.well-known/openid-configuration` part. For instance, Google exposes its discovery document
at `https://accounts.google.com/.well-known/openid-configuration` so the correct issuer to use is `https://accounts.google.com/`:

```xml
<Provider Name="Google" Id="e0e90ce7-adb5-4b05-9f54-594941e5d960">
  <Environment Issuer="https://accounts.google.com/" />
</Provider>
```

Unfortunately, the simple fact a provider exposes its server metadata doesn't guarantee that the returned information is complete or valid.
As such, the server metadata MUST be carefully reviewed to ensure the configuration can be used as-is by OpenIddict. In particular,
the following points MUST be checked:

 - The returned `issuer` node matches the base address used to access the `/.well-known/openid-configuration` document. If it doesn't, use the
 returned `issuer` as the `Issuer` attribute and specify a `ConfigurationEndpoint` attribute containing the location of the server metadata:

  ```xml
  <Provider Name="OrangeFrance" DisplayName="Orange France" Id="848d89f4-70e2-4a43-a6e1-d15a0fbedfff"
            Documentation="https://developer.orange.com/apis/authentication-fr/getting-started">
    <Environment Issuer="https://openid.orange.fr/"
                 ConfigurationEndpoint="https://api.orange.com/openidconnect/fr/v1/.well-known/openid-configuration" />
  </Provider>
  ```

  - The returned `grant_types_supported` node contains all the grant types officially supported by the authorization server.
  If it doesn't **and the server supports the authorization code flow and at least another grant (e.g `refresh_token`)**,
  the dynamic configuration will need to be amended at runtime. For that, update the `AmendGrantTypes` event handler present in
[OpenIddictClientWebIntegrationHandlers.Discovery.cs](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationHandlers.Discovery.cs):

  ```csharp
  /// <summary>
  /// Contains the logic responsible for amending the supported grant types for the providers that require it.
  /// </summary>
  public sealed class AmendGrantTypes : IOpenIddictClientHandler<HandleConfigurationResponseContext>
  {
      /// <summary>
      /// Gets the default descriptor definition assigned to this handler.
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

          // Note: some providers don't list the grant types they support, which prevents the OpenIddict
          // client from using them (unless they are assumed to be enabled by default, like the
          // authorization code or implicit flows). To work around that, the list of supported grant
          // types is amended to include the known supported types for the providers that require it.

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

  - If the provider is known to support OpenID Connect, the returned `scopes_supported` contains the `openid` value. If it doesn't contain this
  special scope, the dynamic configuration will need to be amended at runtime. For that, update the `AmendScopes` event handler present in
[OpenIddictClientWebIntegrationHandlers.Discovery.cs](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationHandlers.Discovery.cs):

  ```csharp
  /// <summary>
  /// Contains the logic responsible for amending the supported scopes for the providers that require it.
  /// </summary>
  public sealed class AmendScopes : IOpenIddictClientHandler<HandleConfigurationResponseContext>
  {
      /// <summary>
      /// Gets the default descriptor definition assigned to this handler.
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

          // While it is a recommended node, some providers don't include "scopes_supported" in their
          // configuration and thus are treated as OAuth 2.0-only providers by the OpenIddict client.
          // To avoid that, the "openid" scope is manually added to indicate OpenID Connect is supported.
          if (context.Registration.ProviderType is ProviderTypes.EpicGames or ProviderTypes.Xero)
          {
              context.Configuration.ScopesSupported.Add(Scopes.OpenId);
          }

          return default;
      }
  }
  ```

### The server doesn't provide a configuration endpoint

When the server doesn't support the OpenID Connect/OAuth 2.0 server metadata specification(s), add an `Issuer` attribute (corresponding to either
the value given in the documentation or the base address of the server) **and** a `<Configuration>` node with the static configuration needed by
the OpenIddict client to communicate with the remote authorization server. For instance:

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

When the provider only supports the authorization code flow (typically with non-expiring access tokens), the `<GrantType>` nodes
SHOULD be removed for clarity, as the authorization code flow is always considered supported by default if no `<GrantType>` is present:

```xml
<Provider Name="Reddit" Id="01ae8033-935c-43b9-8568-eaf4d08c0613">
  <Environment Issuer="https://www.reddit.com/">
    <Configuration AuthorizationEndpoint="https://www.reddit.com/api/v1/authorize"
                   TokenEndpoint="https://www.reddit.com/api/v1/access_token"
                   UserinfoEndpoint="https://oauth.reddit.com/api/v1/me" />
  </Environment>
</Provider>
```

When the provider is known to support Proof Key for Code Exchange (PKCE), a `<CodeChallengeMethod>` node MUST be added under
`<Configuration>` to ensure the OpenIddict client will send appropriate `code_challenge`/`code_challenge_method` parameters:

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
> Some providers use a multitenant configuration that relies on a subdomain, a custom domain or a virtual path to discriminate tenant instances.
> If the provider you want to support requires adding a dynamic part in one of its URIs, a `<Setting>` node MUST be added under `<Provider>` to
> store the tenant name. Once added, the URIs can include a placeholder pointing to the desired setting property:
>
> ```xml
> <Provider Name="Zendesk" Id="89fdfe22-c796-4227-a44a-d9cd3c467bbb">
>   <!--
>     Note: Zendesk is a multitenant provider that relies on subdomains to identify instances.
>     As such, the following URIs all include a {settings.Tenant} placeholder that will be
>     replaced by OpenIddict at runtime by the tenant configured in the Zendesk settings.
>   -->
> 
>   <Environment Issuer="https://{settings.Tenant}.zendesk.com/">
>     <Configuration AuthorizationEndpoint="https://{settings.Tenant}.zendesk.com/oauth/authorizations/new"
>                    TokenEndpoint="https://{settings.Tenant}.zendesk.com/oauth/tokens"
>                    UserinfoEndpoint="https://{settings.Tenant}.zendesk.com/api/v2/users/me" />
>   </Environment>
> 
>   <Setting PropertyName="Tenant" ParameterName="tenant" Type="String" Required="true"
>            Description="The tenant used to identify the Zendesk instance" />
> </Provider>
> ```

## Unwrap userinfo responses if necessary

If the provider returns wrapped or nested userinfo responses (e.g under a `response` or `data` node), the `UnwrapUserinfoResponse` handler in
[OpenIddictClientWebIntegrationHandlers.Userinfo.cs](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationHandlers.Userinfo.cs)
must be updated to unwrap the userinfo payload and allow OpenIddict to map them to flat CLR `Claim` instances:

```csharp
/// <summary>
/// Contains the logic responsible for extracting the userinfo response
/// from nested JSON nodes (e.g "data") for the providers that require it.
/// </summary>
public sealed class UnwrapUserinfoResponse : IOpenIddictClientHandler<ExtractUserinfoResponseContext>
{
    /// <summary>
    /// Gets the default descriptor definition assigned to this handler.
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
            // Fitbit returns a nested "user" object.
            ProviderTypes.Fitbit => new(context.Response["user"]?.GetNamedParameters() ??
                throw new InvalidOperationException(SR.FormatID0334("user"))),

            // StackExchange returns an "items" array containing a single element.
            ProviderTypes.StackExchange => new(context.Response["items"]?[0]?.GetNamedParameters() ??
                throw new InvalidOperationException(SR.FormatID0334("items/0"))),

            // SubscribeStar returns a nested "user" object that is itself nested in a GraphQL "data" node.
            ProviderTypes.SubscribeStar => new(context.Response["data"]?["user"]?.GetNamedParameters() ??
                throw new InvalidOperationException(SR.FormatID0334("data/user"))),

            _ => context.Response
        };

        return default;
    }
}
```

> [!NOTE]
> If you're unsure whether the provider returns wrapped responses or not, the
> received payload can be found in the logs after a successful authorization flow:
>
> ```
> OpenIddict.Client.OpenIddictClientDispatcher: Information: The userinfo response returned by https://contoso.com/users/me was successfully extracted: {
>   "data": {
>     "username": "odile.donat",
>     "name": "Odile Donat",
>     "email": "odile.donat@fabrikam.com"
>   }
> }.
> ```

## If the provider doesn't support standard OpenID Connect userinfo, map the provider-specific claims to their `ClaimTypes` equivalent

If the provider doesn't return an `id_token` and doesn't offer a standard userinfo endpoint, it is likely it uses custom parameters
to represent things like the user identifier. If so, update the `MapCustomWebServicesFederationClaims` event handler in
[OpenIddictClientWebIntegrationHandlers.cs](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationHandlers.cs)
to map these parameters to the usual WS-Federation claims exposed by the .NET BCL `ClaimTypes` class, which simplifies integration
with libraries like ASP.NET Core Identity:

```csharp
/// <summary>
/// Contains the logic responsible for mapping select custom claims to
/// their WS-Federation equivalent for the providers that require it.
/// </summary>
public sealed class MapCustomWebServicesFederationClaims : IOpenIddictClientHandler<ProcessAuthenticationContext>
{
    /// <summary>
    /// Gets the default descriptor definition assigned to this handler.
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
            // ServiceChannel returns the user identifier as a custom "Email" node:
            ProviderTypes.ServiceChannel => (string?) context.UserinfoResponse?["Email"],

            _ => context.MergedPrincipal.GetClaim(ClaimTypes.Email)
        });

        context.MergedPrincipal.SetClaim(ClaimTypes.Name, context.Registration.ProviderType switch
        {
            // ServiceChannel returns the user identifier as a custom "UserName" node:
            ProviderTypes.ServiceChannel => (string?) context.UserinfoResponse?["UserName"],

            _ => context.MergedPrincipal.GetClaim(ClaimTypes.Name)
        });

        context.MergedPrincipal.SetClaim(ClaimTypes.NameIdentifier, context.Registration.ProviderType switch
        {
            // ServiceChannel returns the user identifier as a custom "UserId" node:
            ProviderTypes.ServiceChannel => (string?) context.UserinfoResponse?["UserId"],

            _ => context.MergedPrincipal.GetClaim(ClaimTypes.NameIdentifier)
        });

        return default;
    }
}
```

## Test the generated provider

If the targeted service is fully standard-compliant, no additional configuration should be required at this point.

To confirm it, build the solution and add a client registration of the new provider to one of the sandbox projects:
  - For `OpenIddict.Sandbox.Console.Client` (the recommended option), in `Program.cs`.
  - For `OpenIddict.Sandbox.AspNet.Client` (ASP.NET 4.8) or `OpenIddict.Sandbox.AspNetCore.Client` (ASP.NET Core), in `Startup.cs`.

```csharp
// Register the Web providers integrations.
//
// Note: to mitigate mix-up attacks, it's recommended to use a unique redirection endpoint
// URI per provider, unless all the registered providers support returning a special "iss"
// parameter containing their URL as part of authorization responses. For more information,
// see https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#section-4.4.
options.UseWebProviders()
       // ... other providers...
       .Add[provider name](options =>
       {
           options.SetClientId("[client identifier]");
           options.SetClientSecret("[client secret]");
           options.SetRedirectUri("callback/login/[provider name]");

           // Note: depending on the provider, configuring other options MAY be required.
       });
```

Once configured, start an authentication dance to test if the provider integration works as-is.

> [!NOTE]
> Unless you agree to share your sandbox credentials with the OpenIddict developers, the changes
> made to the sandbox project don't need to be committed and included in your pull request.

## If necessary, add the necessary workarounds for the provider to work correctly

If an error occurs during the authentication process, the provider MAY require one or multiple workarounds for the integration to work correctly:

  - The provider MAY require sending the client credentials as part of the `Authorization` header using basic authentication (i.e `client_secret_basic`).
Providers that implement OpenID Connect discovery or OAuth 2.0 authorization server metadata will typically return the client authentication methods they support.
If the provider doesn't expose its metadata, the supported methods MUST be added manually to the static configuration using one or multiple `<TokenEndpointAuthMethod>`:

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

  - The provider MAY require sending one or multiple default or required scopes. If so, the default/required scopes MUST be added to the `<Environment>` node:

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
        Note: Twitter requires requesting the "tweet.read" and "users.read" scopes for the
        userinfo endpoint to work correctly. As such, these 2 scopes are marked as required
        so they are always sent even if they were not explicitly added by the user.
      -->

      <Scope Name="tweet.read" Default="true" Required="true" />
      <Scope Name="users.read" Default="true" Required="true" />
    </Environment>
  </Provider>
  ```

  - The provider MAY require sending the scopes using a different separator than the standard one. While the OAuth 2.0 specification requires using
a space to separate multiple scopes, some providers require using a different separator (typically, a comma). If the provider you're adding requires it,
update the `FormatNonStandardScopeParameter` event handler present in
[OpenIddictClientWebIntegrationHandlers.cs](https://github.com/openiddict/openiddict-core/blob/dev/src/OpenIddict.Client.WebIntegration/OpenIddictClientWebIntegrationHandlers.cs) to use the correct separator required by the provider.

  ```csharp
  /// <summary>
  /// Contains the logic responsible for overriding the standard "scope"
  /// parameter for providers that are known to use a non-standard format.
  /// </summary>
  public class FormatNonStandardScopeParameter : IOpenIddictClientHandler<ProcessChallengeContext>
  {
      /// <summary>
      /// Gets the default descriptor definition assigned to this handler.
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
              // The following providers are known to use comma-separated scopes instead of
              // the standard format (that requires using a space as the scope separator):
              ProviderTypes.Deezer or ProviderTypes.Shopify or ProviderTypes.Strava
                  => string.Join(",", context.Scopes),

              // The following providers are known to use plus-separated scopes instead of
              // the standard format (that requires using a space as the scope separator):
              ProviderTypes.Trovo => string.Join("+", context.Scopes),

              _ => context.Request.Scope
          };

          return default;
      }
  }
  ```

> [!NOTE]
> If the provider still doesn't work, it's unfortunately very likely more complex workarounds will be required.
> If you're not familiar with the OpenIddict events model, open a ticket in the
> [`openiddict-core`](https://github.com/openiddict/openiddict-core/issues) repository to get help.

## Send a pull request against the `openiddict-core` repository

Once you've been able to confirm that your provider works correctly, all you need to do is send a PR so that it can be added to
the [`openiddict-core`](https://github.com/openiddict/openiddict-core/issues) repository
and ship with the already supported providers as part of the next update.
