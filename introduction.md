# Introduction

OpenIddict is **a free and open source framework for building flexible and standard-compliant OAuth 2.0/OpenID Connect clients and servers in .NET**.

## History

OpenIddict was born in late 2015 and was initially based on [AspNet.Security.OpenIdConnect.Server](https://github.com/aspnet-contrib/AspNet.Security.OpenIdConnect.Server)
(codenamed ASOS), a low-level OpenID Connect server middleware inspired by the OAuth 2.0 authorization server middleware developed by Microsoft for the OWIN project
and the first OpenID Connect server ever created for ASP.NET Core.

In 2020, ASOS was merged into OpenIddict 3.0+ to form a unified stack under the OpenIddict umbrella, while still offering an easy-to-use approach for new users
and a low-level experience for advanced users thanks to a "degraded mode" that allows using OpenIddict in a stateless way (i.e without a backing database).

As part of this process, native support for `Microsoft.Owin` was added to OpenIddict 3.0+ to allow using it in legacy ASP.NET 4.6.1 (and higher) applications,
making it an excellent candidate for replacing `OAuthAuthorizationServerMiddleware` and `OAuthBearerAuthenticationMiddleware` without having to migrate to ASP.NET Core.

In 2022, a whole new OAuth 2.0 + OpenID Connect client stack was added to OpenIddict and shipped with an `OpenIddict.Client.WebIntegration` companion
package aiming at replacing the existing [aspnet-contrib social providers](https://github.com/aspnet-contrib/AspNet.Security.OAuth.Providers)
(the aspnet-contrib providers are still supported, but the OpenIddict Web providers are now strongly recommended for new applications).

To make the OpenIddict client usable in more scenarios, complete support for desktop applications
was added in OpenIddict 4.1 and mobile platforms are supported since OpenIddict 5.8.

## Core concepts

### Modular design

OpenIddict adopts a fully modular design and offers 3 powerful stacks that can be used together or independently:

  - A client stack, that can be used to integrate with remote OAuth 2.0/OpenID Connect servers.
  - A server stack, that can be used to create your own OAuth 2.0/OpenID Connect server.
  - A validation stack, that can be used to implement token authentication in your APIs.

The 3 stacks are configured separately and can use the `OpenIddict.Core` package that provides the persistence logic:

```csharp
services.AddOpenIddict()
    .AddCore(options =>
    {
        // ...
    })
    .AddClient(options =>
    {
        // ...
    })
    .AddServer(options =>
    {
        // ...
    })
    .AddValidation(options =>
    {
        // ...
    });
```

### Coupling

To offer a unified experience across all the platforms it supports, the OpenIddict client, server and validation stacks were designed to
avoid a tight coupling with a specific host or platform. As such, the `OpenIddict.Client`, `OpenIddict.Server` and `OpenIddict.Validation` packages
deliberately don't depend on ASP.NET Core and only contain generic logic that can be used in any implementation (including non-official hosts):
companion packages like `OpenIddict.Client.AspNetCore` or `OpenIddict.Client.Owin` are provided to support integrating with a specific host.

For the same reason, the persistence logic is not tied to a specific ORM or database: while
**[Entity Framework Core](/integrations/entity-framework-core.md)**, **[Entity Framework 6.x](/integrations/entity-framework.md)** and
**[MongoDB](/integrations/mongodb.md)** are supported out-of-the-box, custom stores can also be implemented to support any other provider.

### User authentication

Unlike other solutions, **OpenIddict exclusively focuses on the OAuth 2.0/OpenID Connect protocol aspects of the authorization process**
and leaves user authentication up to the implementer: OpenIddict can be natively used with any form of user authentication like password, token,
federated or Integrated Windows Authentication (NTLM/Kerberos). While convenient, using a membership stack like ASP.NET Core Identity is not required.

> [!TIP]
> When used with ASP.NET or ASP.NET Core, integration with OpenIddict is typically done by enabling the pass-through mode to handle requests in a
> controller action, in a Razor Page, in a Web Form or in a minimal API handler or, for more complex scenarios, by directly using its advanced events model.

### Pass-through support

As with `OAuthAuthorizationServerMiddleware`, the OpenIddict server allows handling authorization, logout and token requests in custom controller actions or
any other middleware able to hook into the ASP.NET Core or OWIN request processing pipeline. In this case, OpenIddict will always validate incoming requests
first (e.g by ensuring the mandatory parameters are present and valid) before allowing the rest of the pipeline to be invoked: should any validation error occur,
OpenIddict will automatically reject the request before it reaches user-defined controller actions or custom middleware.

The same exact concept also exists in the OpenIddict client stack, where the pass-through mode can be used to handle callbacks/redirection requests in
custom code and apply any logic needed by the application (e.g filtering claims, storing the identity in an authentication cookie, etc.). 

```csharp
builder.Services.AddOpenIddict()
    .AddServer(options =>
    {
        // Enable the authorization and token endpoints.
        options.SetAuthorizationEndpointUris("/authorize")
               .SetTokenEndpointUris("/token");

        // Enable the authorization code flow.
        options.AllowAuthorizationCodeFlow();

        // Register the signing and encryption credentials.
        options.AddDevelopmentEncryptionCertificate()
               .AddDevelopmentSigningCertificate();

        // Register the ASP.NET Core host and configure the authorization endpoint
        // to allow the /authorize minimal API handler to handle authorization requests
        // after being validated by the built-in OpenIddict server event handlers.
        //
        // Token requests will be handled by OpenIddict itself by reusing the identity
        // created by the /authorize handler and stored in the authorization codes.
        options.UseAspNetCore()
               .EnableAuthorizationEndpointPassthrough();
    });
```

```csharp
app.MapGet("/authorize", async (HttpContext context) =>
{
    // Resolve the claims stored in the principal created after the Steam authentication dance.
    // If the principal cannot be found, trigger a new challenge to redirect the user to Steam.
    var principal = (await context.AuthenticateAsync(SteamAuthenticationDefaults.AuthenticationScheme))?.Principal;
    if (principal is null)
    {
        return Results.Challenge(properties: null, [SteamAuthenticationDefaults.AuthenticationScheme]);
    }

    var identifier = principal.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    // Create a new identity and import a few select claims from the Steam principal.
    var identity = new ClaimsIdentity(TokenValidationParameters.DefaultAuthenticationType);
    identity.AddClaim(new Claim(Claims.Subject, identifier));
    identity.AddClaim(new Claim(Claims.Name, identifier).SetDestinations(Destinations.AccessToken));

    return Results.SignIn(new ClaimsPrincipal(identity), properties: null, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
});
```

### Events model

OpenIddict implements a powerful event-based model for its client, server and validation stacks: each part of the request processing logic
is implemented as an event handler that can be removed, moved to a different position in the pipeline or replaced by a custom handler to
override the default logic used by OpenIddict:

```csharp
/// <summary>
/// Contains the logic responsible of rejecting authorization requests that don't specify a valid prompt parameter.
/// </summary>
public class ValidatePromptParameter : IOpenIddictServerHandler<ValidateAuthorizationRequestContext>
{
    /// <summary>
    /// Gets the default descriptor definition assigned to this handler.
    /// </summary>
    public static OpenIddictServerHandlerDescriptor Descriptor { get; }
        = OpenIddictServerHandlerDescriptor.CreateBuilder<ValidateAuthorizationRequestContext>()
            .UseSingletonHandler<ValidatePromptParameter>()
            .SetOrder(ValidateNonceParameter.Descriptor.Order + 1_000)
            .SetType(OpenIddictServerHandlerType.BuiltIn)
            .Build();

    /// <inheritdoc/>
    public ValueTask HandleAsync(ValidateAuthorizationRequestContext context)
    {
        if (context is null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        // Reject requests specifying prompt=none with consent/login or select_account.
        if (context.Request.HasPrompt(Prompts.None) && (context.Request.HasPrompt(Prompts.Consent) ||
                                                        context.Request.HasPrompt(Prompts.Login) ||
                                                        context.Request.HasPrompt(Prompts.SelectAccount)))
        {
            context.Logger.LogInformation(SR.GetResourceString(SR.ID6040));

            context.Reject(
                error: Errors.InvalidRequest,
                description: SR.FormatID2052(Parameters.Prompt),
                uri: SR.FormatID8000(SR.ID2052));

            return default;
        }

        return default;
    }
}
```

In OpenIddict itself, event handlers are typically defined as dedicated classes but they can also be registered using delegates:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.AddEventHandler<HandleConfigurationRequestContext>(builder =>
            builder.UseInlineHandler(context =>
            {
                // Attach custom metadata to the configuration document.
                context.Metadata["custom_metadata"] = 42;

                return default;
            }));
    });
```

### Degraded mode

Designed to offer a low-level experience to advanced users, the degraded mode allows using OpenIddict in a stateless way by disabling all the features
that normally depend on the `OpenIddict.Core` package, which includes things like `client_id`/`client_secret` or `redirect_uri` validation,
reference tokens and token revocation support. Since these critical parts are not handled by OpenIddict when enabling the degraded mode,
you're expected to register custom event handlers that will implement the necessary features using your own logic (and your own database!).

> [!TIP]
> For more information on the degraded mode, read
> [Creating an OpenID Connect server proxy with OpenIddict 3.0's degraded mode](https://kevinchalet.com/2020/02/18/creating-an-openid-connect-server-proxy-with-openiddict-3-0-s-degraded-mode/).
