# Understanding the different token formats

OpenIddict can be configured to use three access token formats:

- opaque tokens (default)
- reference tokens
- JWTs (Json Web Tokens)
 
Tokens differ in what they look like and how they are validated. The default tokens will work fine in most use cases. There are times, however, where the other token formats would be preferred or required.
 
> **Note: Identity tokens are always JWTs, according to spec.**

## Opaque tokens (default)

The default access tokens are opaque tokens. They are encrypted and signed by the authorization server using the ASP.NET Core Data Protection stack. Their contents can only be inspected by the authorization server or another server sharing the same ASP.NET Core Data Protection configuration.

These are "proprietary" tokens that are not meant to be read or verified by a third-party, as the token format is not standard and necessarily relies on symmetric signing and encryption.

We use this format for authorization codes and refresh tokens. They are only meant to be consumed by OpenIddict itself.

### Benefits
- No additional configuration required
- Uses OpenIddict's built-in validation
- Resource servers can validate tokens without having to contact authorization server if using shared ASP.NET Core DataProtection
- Tokens are encrypted so no one can inspect the token, e.g. if tokens somehow end up in your logs somewhere or are intercepted somehow

### Drawbacks
- Proprietary format, so if you add non .NET Core resource servers in the future you need to switch to JWTs for direct validation or use introspection for indirect validation
- Claims are stored within the token, which is convenient but token size could get large if there are a lot of claims (probably not an issue in real-world scenarios)
- Token expiration is in the token itself, so even if users sign out their tokens will still be valid until they reach their expiration

### Setup and API validation configuration
[Here](../configuration/token-setup-and-validation.md#default-configuration-opaque-tokens)

---

## Reference tokens
When using reference token format, authorization codes, access tokens and refresh tokens are stored as ciphertext in the database and a crypto-secure random identifier is returned to the client application.
    
### Benefits
- Minimal configuration required
- Uses OpenIddict's built-in validation
- Resource servers can validate tokens without having to contact authorization server
- Token sizes are very small regardless of number of claims because they only contain ids
- Issued tokens are tracked in data store
- Can immediately be revoked

### Drawbacks
- .NET Core validation only (although someone could write it for other platforms)
- Requires a connection to OpenIddict's data store, e.g. Entity Framework DataContext. Resource servers may not want to have to reference OpenIddict's database
- Because only ids are in the access tokens, a call to the database is required for every request

### Setup and API validation configuration
[Here](../configuration/token-setup-and-validation.md#reference-token-format)

---

## JWTs (JSON Web Tokens)
These are standard tokens verifiable by third parties, used by Azure Active Directory, Auth0, and other valid OAuth 2.0 service. They are signed by the authorization server but their contents are not encrypted so they can be read by anyone.

### Benefits
- Good to be familiar with JWTs because they are a commonly used access token type in OAuth 2.0 and are also `id token` type
- Plenty of platforms include JWT validation libraries (.NET, PHP, Node, Python, etc)
- Future proof

### Drawbacks
- Anyone can inspect contents (see https://jwt.io/), so if token is hanging around in a log somewhere or intercepted somehow all claims or other information in the token can be read, even if token is expired
- Claims are stored within the token, which is convenient but token size could get large if there are a lot of claims (probably not an issue in real-world scenarios)
- Token expiration is in the token itself, so even if users sign out their tokens will still be valid until they reach their expiration

### Setup and API validation configuration
[Here](../configuration/token-setup-and-validation.md#jwts)
 
 
