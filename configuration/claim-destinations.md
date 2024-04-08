# Claim destinations

**When generating authorization codes, refresh tokens and device/user codes** from the `ClaimsPrincipal` specified during a sign-in operation,
**OpenIddict automatically copies all the claims to the resulting codes/tokens**. This is a safe operation because these tokens are always encrypted
and can't be read by anyone but OpenIddict itself (the user or the client application that requested them cannot read their content).

**For access and identity tokens, things work differently**, as these tokens are meant to be read by different parties:
  - Client applications have a total access to the claims contained in the identity tokens they receive.
  - Resource servers are expected to be able to read the claims contained in the access tokens used in API calls.
  - With desktop, mobile or browser-based applications, it's generally not hard for users to access identity tokens
(e.g by intercepting the HTTP response using Fiddler, by using developer tools or by dumping the memory of the client process).
  - If access token encryption was explicitly disabled, it's possible for the client applications or the users themselves
to access the content of access tokens (e.g by copying the token payload and using a tool like https://jwt.io/).

For these reasons, **OpenIddict doesn't automatically copy the claims attached to a `ClaimsPrincipal` to access or identity tokens**
(except the `sub` claim, which is the only mandatory claim in OpenIddict). To allow OpenIddict to persist specific claims
to an access or identity token, a flag known as "claim destination" must be added to each `Claim` instance you want to expose.

> [!NOTE]
> To attach one or multiple destinations to a claim, use the `principal.SetDestinations()` extension defined in `OpenIddict.Abstractions`.
> In the typical case, granted scopes can be used to determine what claims are allowed to be copied to access and identity tokens, as in this example:

```csharp
var principal = await _signInManager.CreateUserPrincipalAsync(user);

// Note: in this sample, the granted scopes match the requested scope
// but you may want to allow the user to uncheck specific scopes.
// For that, simply restrict the list of scopes before calling SetScopes().
principal.SetScopes(request.GetScopes());
principal.SetResources(await _scopeManager.ListResourcesAsync(principal.GetScopes()).ToListAsync());
principal.SetDestinations(static claim => claim.Type switch
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

return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
```