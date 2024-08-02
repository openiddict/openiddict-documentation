# Authorization storage <Badge type="info" text="core" /><Badge type="danger" text="server" /><Badge type="tip" text="validation" />

To keep track of logical chains of tokens and user consents, the OpenIddict server supports storing authorizations
(also known as "grants" in some OpenID Connect implementations) in the database and using them in your code to determine
whether a consent view should be returned or not, depending on your own logic.

## Types of authorizations

Authorizations can be of two types: permanent and ad-hoc.

### Permanent authorizations

**Permanent authorizations are developer-defined authorizations** created using the `IOpenIddictAuthorizationManager.CreateAsync()` API
and explicitly attached to a `ClaimsPrincipal` using the OpenIddict-specific `principal.SetAuthorizationId()` extension method.

Such authorizations are typically used to remember user consents and avoid displaying a consent view for each authorization request.
For that, a "consent type" can be defined per-application, as in the following example:

```csharp
// Retrieve the application details from the database.
var application = await _applicationManager.FindByClientIdAsync(request.ClientId) ??
    throw new InvalidOperationException("The application cannot be found.");

// Retrieve the permanent authorizations associated with the user and the application.
var authorizations = await _authorizationManager.FindAsync(
    subject: await _userManager.GetUserIdAsync(user),
    client : await _applicationManager.GetIdAsync(application),
    status : Statuses.Valid,
    type   : AuthorizationTypes.Permanent,
    scopes : request.GetScopes()).ToListAsync();

switch (await _applicationManager.GetConsentTypeAsync(application))
{
    // If the consent is external (e.g when authorizations are granted by a sysadmin),
    // immediately return an error if no authorization can be found in the database.
    case ConsentTypes.External when !authorizations.Any():
        return Forbid(
            authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            properties: new AuthenticationProperties(new Dictionary<string, string>
            {
                [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.ConsentRequired,
                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                    "The logged in user is not allowed to access this client application."
            }));

    // If the consent is implicit or if an authorization was found,
    // return an authorization response without displaying the consent form.
    case ConsentTypes.Implicit:
    case ConsentTypes.External when authorizations.Any():
    case ConsentTypes.Explicit when authorizations.Any() && !request.HasPrompt(Prompts.Consent):
        // Create the claims-based identity that will be used by OpenIddict to generate tokens.
        var identity = new ClaimsIdentity(
            authenticationType: TokenValidationParameters.DefaultAuthenticationType,
            nameType: Claims.Name,
            roleType: Claims.Role);

        // Add the claims that will be persisted in the tokens.
        identity.SetClaim(Claims.Subject, await _userManager.GetUserIdAsync(user))
                .SetClaim(Claims.Email, await _userManager.GetEmailAsync(user))
                .SetClaim(Claims.Name, await _userManager.GetUserNameAsync(user))
                .SetClaims(Claims.Role, (await _userManager.GetRolesAsync(user)).ToImmutableArray());

        // Note: in this sample, the granted scopes match the requested scope
        // but you may want to allow the user to uncheck specific scopes.
        // For that, simply restrict the list of scopes before calling SetScopes.
        identity.SetScopes(request.GetScopes());
        identity.SetResources(await _scopeManager.ListResourcesAsync(identity.GetScopes()).ToListAsync());

        // Automatically create a permanent authorization to avoid requiring explicit consent
        // for future authorization or token requests containing the same scopes.
        var authorization = authorizations.LastOrDefault();
        authorization ??= await _authorizationManager.CreateAsync(
            identity: identity,
            subject : await _userManager.GetUserIdAsync(user),
            client  : await _applicationManager.GetIdAsync(application),
            type    : AuthorizationTypes.Permanent,
            scopes  : identity.GetScopes());

        identity.SetAuthorizationId(await _authorizationManager.GetIdAsync(authorization));
        identity.SetDestinations(static claim => claim.Type switch
        {
            // If the "profile" scope was granted, allow the "name" claim to be
            // added to the access and identity tokens derived from the principal.
            Claims.Name when claim.Subject.HasScope(Scopes.Profile) =>
            [
                OpenIddictConstants.Destinations.AccessToken,
                OpenIddictConstants.Destinations.IdentityToken
            ],

            // Never add the "secret_value" claim to access or identity tokens.
            // In this case, it will only be added to authorization codes,
            // refresh tokens and user/device codes, that are always encrypted.
            "secret_value" => [],

            // Otherwise, add the claim to the access tokens only.
            _ => [OpenIddictConstants.Destinations.AccessToken]
        });

        return SignIn(new ClaimsPrincipal(identity), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);

    // At this point, no authorization was found in the database and an error must be returned
    // if the client application specified prompt=none in the authorization request.
    case ConsentTypes.Explicit   when request.HasPrompt(Prompts.None):
    case ConsentTypes.Systematic when request.HasPrompt(Prompts.None):
        return Forbid(
            authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            properties: new AuthenticationProperties(new Dictionary<string, string>
            {
                [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.ConsentRequired,
                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                    "Interactive user consent is required."
            }));

    // In every other case, render the consent form.
    default: return View(new AuthorizeViewModel
    {
        ApplicationName = await _applicationManager.GetLocalizedDisplayNameAsync(application),
        Scope = request.Scope
    });
}
```

### Ad-hoc authorizations

**Ad-hoc authorizations are automatically created by OpenIddict when a chain of tokens needs to be tracked for security reasons**,
but no explicit permanent authorization was attached by the developer to the `ClaimsPrincipal` used for the sign-in operation.

Such authorizations are typically created in the authorization code flow to link all the tokens associated with the original authorization code,
so that they can be automatically revoked if the authorization code was redeemed multiple times (which may indicate a token leakage).
In the same vein, ad-hoc authorizations are also created when a refresh token is returned during a resource owner password credentials grant request.

> [!NOTE]
> When using the [OpenIddict.Quartz](https://www.nuget.org/packages/OpenIddict.Quartz/) integration, ad-hoc authorizations are automatically
> removed from the database after a short period of time (14 days by default). Unlike ad-hoc authorizations, permanent authorizations
> are never removed from the database.

## Enabling authorization entry validation at the API level <Badge type="tip" text="validation" />

**For performance reasons, OpenIddict 3.0 doesn't check, by default, the status of an authorization entry when receiving an API request**: access tokens are considered
valid even if the attached authorization was revoked. For scenarios that require immediate authorization revocation, the OpenIddict validation handler can be configured
to enforce authorization entry validation for each API request:

> [!NOTE]
> Enabling authorization entry validation requires that the OpenIddict validation handler have a direct access to the server database where
> authorizations are stored, which makes it better suited for APIs located in the same application as the authorization server.
> For external applications, consider using introspection instead of local validation.
>
> In both cases, additional latency – caused by the additional DB request and the HTTP call for introspection – is expected.

```csharp
services.AddOpenIddict()
    .AddValidation(options =>
    {
        options.EnableAuthorizationEntryValidation();
    });
```

## Disabling authorization storage <Badge type="danger" text="server" />

While STRONGLY discouraged, authorization storage can be disabled in the server options:

```csharp
services.AddOpenIddict()
    .AddServer(options =>
    {
        options.DisableAuthorizationStorage();
    });
```
