# ASP.NET Core

Thanks to their native ASP.NET Core integrations, the client, server and validation features offered by OpenIddict can be used in any
ASP.NET Core 2.1+ application, independently of whether they are using MVC controllers, Razor Pages, minimal API handlers or raw middleware.

## Supported versions

| ASP.NET Core version | .NET runtime version | OpenIddict 4.x                          | OpenIddict 5.x                          |
|----------------------|----------------------|-----------------------------------------|-----------------------------------------|
| ASP.NET Core 2.1     | .NET Framework 4.6.1 | :heavy_check_mark: :information_source: | :heavy_check_mark: :information_source: |
| ASP.NET Core 2.1     | .NET Framework 4.7.2 | :heavy_check_mark:                      | :heavy_check_mark:                      |
| ASP.NET Core 2.1     | .NET Framework 4.8   | :heavy_check_mark:                      | :heavy_check_mark:                      |
| ASP.NET Core 2.1     | .NET Core 2.1        | :exclamation:                           | :exclamation:                           |
|                      |                      |                                         |                                         |
| ASP.NET Core 3.1     | .NET Core 3.1        | :heavy_check_mark:                      | :exclamation:                           |
|                      |                      |                                         |                                         |
| ASP.NET Core 5.0     | .NET 5.0             | :exclamation:                           | :exclamation:                           |
| ASP.NET Core 6.0     | .NET 6.0             | :heavy_check_mark:                      | :heavy_check_mark:                      |
| ASP.NET Core 7.0     | .NET 7.0             | :heavy_check_mark:                      | :exclamation:                           |
| ASP.NET Core 8.0     | .NET 8.0             | :heavy_check_mark:                      | :heavy_check_mark:                      |

> [!WARNING]
> **ASP.NET Core 2.1 on .NET Core 2.1, ASP.NET Core 3.1, 5.0 and 7.0 are no longer supported by Microsoft. While OpenIddict can still be used
> on these platforms thanks to its .NET Standard 2.0 compatibility, users are strongly encouraged to migrate to ASP.NET Core/.NET 8.0**.
>
> ASP.NET Core 2.1 on .NET Framework 4.6.1 (and higher) is still fully supported.

> [!NOTE]
> **The following features are not available when targeting .NET Framework 4.6.1**:
>  - X.509 development encryption/signing certificates: calling `AddDevelopmentEncryptionCertificate()` or `AddDevelopmentSigningCertificate()`
> will result in a `PlatformNotSupportedException` being thrown at runtime if no valid development certificate can be found and a new one must be generated.
>  - X.509 ECDSA signing certificates/keys: calling `AddSigningCertificate()` or `AddSigningKey()`
> with an ECDSA certificate/key will always result in a `PlatformNotSupportedException` being thrown at runtime.

## Basic configuration

Native ASP.NET Core integration is provided by 3 dedicated packages that can be used together or
independently (depending on whether you need the client, server and validation features in your project):

```xml
<PackageReference Include="OpenIddict.Client.AspNetCore" Version="5.7.0" />
<PackageReference Include="OpenIddict.Server.AspNetCore" Version="5.7.0" />
<PackageReference Include="OpenIddict.Validation.AspNetCore" Version="5.7.0" />
```

To enable the ASP.NET Core integration, simply call `UseAspNetCore()` for each OpenIddict feature (client, server and validation) you want to add:

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
> OpenIddict integrates with ASP.NET Core using an `IAuthenticationRequestHandler` service.
>
> As such, it is critical that the ASP.NET Core authentication middleware be registered at the
> right place in the pipeline (i.e after `app.UseCors()` and before `app.UseEndpoint()`):
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

## Advanced configuration

### Transport security requirement (client and server)

By default, the OpenIddict server ASP.NET Core integration will refuse to serve non-HTTPS
requests for security reasons and will return an error page to the caller.

For the same reason, the OpenIddict client ASP.NET Core host will, by default, refuse to start authentication challenges
from a non-HTTPS page and will automatically throw an exception to abort these unsafe operations.

While disabling this requirement is strongly discouraged in most cases, it can be disabled using the `DisableTransportSecurityRequirement()` API:

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

> [!DANGER]
> **The transport security requirement SHOULD NEVER be disabled in production**, even when using a reverse proxy doing TLS termination: if requests
> are rejected by OpenIddict when doing TLS termination, this very likely means that the ASP.NET Core application was not properly configured to
> extract and restore the original request details (and more specifically, `HttpRequest.Scheme`).
>
> For more information,
> read [Configure ASP.NET Core to work with proxy servers and load balancers](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer).

### Pass-through mode (client and server)

The OpenIddict client and server stacks offer built-in pass-through support for some of
their endpoints (typically, endpoints for which users will want to provide custom logic).

> [!NOTE]
> For more information on the pass-through mode, read [Pass-through mode](/introduction/index.md#pass-through-mode).

Pass-through mode for a specific endpoint can be enabled using the APIs exposed by `OpenIddictClientAspNetCoreBuilder`
or `OpenIddictServerAspNetCoreBuilder`. E.g for the authorization endpoint:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        // ...

        options.UseAspNetCore()
               .EnableAuthorizationEndpointPassthrough();
    });
```

Once enabled, you can handle authorization requests in an MVC controller or a minimal API handler:

```csharp
app.MapMethods("authorize", [HttpMethods.Get, HttpMethods.Post], async (HttpContext context) =>
{
    // Resolve the claims stored in the cookie created after the GitHub authentication dance.
    // If the principal cannot be found, trigger a new challenge to redirect the user to GitHub.
    //
    // For scenarios where the default authentication handler configured in the ASP.NET Core
    // authentication options shouldn't be used, a specific scheme can be specified here.
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

    // Create the claims-based identity that will be used by OpenIddict to generate tokens.
    var identity = new ClaimsIdentity(
        authenticationType: TokenValidationParameters.DefaultAuthenticationType,
        nameType: Claims.Name,
        roleType: Claims.Role);

    // Import a few select claims from the identity stored in the local cookie.
    identity.AddClaim(new Claim(Claims.Subject, identifier));
    identity.AddClaim(new Claim(Claims.Name, identifier).SetDestinations(Destinations.AccessToken));
    identity.AddClaim(new Claim(Claims.PreferredUsername, identifier).SetDestinations(Destinations.AccessToken));

    return Results.SignIn(new ClaimsPrincipal(identity), properties: null, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
});
```

### Status code pages middleware integration (client and server)

Both the OpenIddict client and server ASP.NET Core hosts offer an option to render error pages using
[ASP.NET Core's status code pages middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling#usestatuscodepages).

To enable this feature, you can use the dedicated `EnableStatusCodePagesIntegration()` API:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.UseAspNetCore()
               .EnableStatusCodePagesIntegration();
    });
```

> [!WARNING]
> You'll need to make sure the status code pages middleware is registered at an appropriate place
> in the ASP.NET Core pipeline (i.e before `app.UseAuthentication()`):
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


### Authorization and logout request caching (server-only)

To simplify flowing large authorization or logout requests, the OpenIddict server ASP.NET Core integration includes a built-in feature
that allows generating a unique `request_id` and caching the received requests in an `IDistributedCache`: when this feature is enabled,
an automatic redirection to the current page with the other parameters removed is triggered by OpenIddict and the cached entry is removed
once the authorization or logout demand has been completed by the user.

To enable this feature, you need to use the dedicated `EnableAuthorizationRequestCaching()` and/or `EnableLogoutEndpointPassthrough()` APIs:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.UseAspNetCore()
               .EnableAuthorizationRequestCaching()
               .EnableLogoutEndpointPassthrough();
    });
```

> [!WARNING]
> When hosting your application on multiple servers, you'll need to make sure you're using a proper `IDistributedCache`
> implementation: the default one uses an in-memory cache under the hood won't work well for distributed scenarios.
>
> For more information, read [Distributed caching in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/performance/caching/distributed).

### Authentication scheme forwarding (client-only)

To simplify triggering authentication operations for a specific client registration, the OpenIddict client offers a built-in authentication scheme
forwarding feature that allows using the provider name assigned to a client registration as an authentication scheme in ASP.NET Core:

```csharp
app.MapGet("challenge", () => Results.Challenge(properties: null, authenticationSchemes: [Providers.GitHub]));
```

This feature is enabled by default but can be disabled if necessary using `DisableAutomaticAuthenticationSchemeForwarding()`:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseAspNetCore()
               .DisableAutomaticAuthenticationSchemeForwarding();
    });
```

If you need to enable forwarding for specific registrations only, you can use the advanced
`AddForwardedAuthenticationScheme()` API to selectively add the schemes you want:

```csharp
services.AddOpenIddict()
    .AddClient(options =>
    {
        options.UseAspNetCore()
               .DisableAutomaticAuthenticationSchemeForwarding()
               .AddForwardedAuthenticationScheme(provider: "Contoso", caption: "Contoso Intranet login");
    });
```

When automatic forwarding is disabled, authentication operations cannot directly use the provider name as an authentication scheme
if no explicit forwarding was configured and must instead use `OpenIddictClientAspNetCoreDefaults.AuthenticationScheme` with an
`AuthenticationProperties` instance containing the provider name, the issuer URI or the registration identifier:

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

### JSON responses indentation (server-only)

By default, the OpenIddict server ASP.NET Core host will return indented JSON responses to make them easier to read.

Users who prefer disabling indentation for JSON responses can do so by calling `SuppressJsonResponseIndentation()`:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.UseAspNetCore()
               .SuppressJsonResponseIndentation();
    });
```
