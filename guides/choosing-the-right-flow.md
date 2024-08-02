# Choosing the right flow <Badge type="warning" text="client" /><Badge type="danger" text="server" />

OpenIddict offers built-in support for all the standard flows defined by the
[OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749) and [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html) core specifications:
[the authorization code flow](https://openid.net/specs/openid-connect-core-1_0.html#CodeFlowAuth),
[the implicit flow](https://openid.net/specs/openid-connect-core-1_0.html#ImplicitFlowAuth),
[the hybrid flow](https://openid.net/specs/openid-connect-core-1_0.html#HybridFlowAuth) (generally treated as a mix between the first two flows),
[the resource owner password credentials grant](https://datatracker.ietf.org/doc/html/rfc6749#section-4.3) and
[the client credentials grant](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4).

> [!IMPORTANT]
> All these flows are supported by both the server and the client stacks, except the legacy OAuth 2.0 implicit flow (i.e `response_type=token`),
> which is supported by the OpenIddict server for compatibility reasons but is not allowed to be negotiated by the OpenIddict client for security reasons.

While not specific to OpenIddict, choosing the best flow(s) for your application is an **important prerequisite**
when implementing your own authorization server ; so here's a quick overview of the different OAuth 2.0/OpenID Connect flows:

## Non-interactive flows

### Resource owner password credentials flow (not recommended for new applications)

Directly inspired by [basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication), the resource owner password credentials grant
(abbreviated *ROPC*) is conceptually **the simplest OAuth 2.0 flow**: the client application asks the user his username/password, sends a token request
to the authorization server with the user credentials (and depending on the client authentication policy defined by the authorization server,
its own client credentials) and gets back an access token it can use to retrieve the user's resources.

![Resource owner password credentials flow](choosing-the-right-flow/resource-owner-password-flow.png)

```http
POST /connect/token HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=johndoe&password=A3ddj3w
```

```http
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token":"2YotnFZFEjr1zCsicMWpAA",
  "token_type":"bearer",
  "expires_in":3600
}
```

> [!CAUTION]
> This flow is **not recommended by the OAuth 2.0 specification** as it's the only grant type where **the user password is directly exposed to the client application**,
> which breaks the principle of least privilege and **makes it unsuitable for third-party client applications that can't be fully trusted by the authorization server**.
>
> While popular and trivial to implement (as it doesn't involve any redirection or consent form and unlike interactive flows, doesn't require implementing
> cross-site request forgery (XSRF) countermeasures to prevent session fixation attacks), **its use in new applications is not recommended**. Instead,
> users are encouraged to use the authorization code flow, that doesn't expose passwords to client applications and is not limited to password authentication.

<!-- more -->

### Client credentials grant (recommended for machine-to-machine communication)

The client credentials grant is almost identical to the resource owner password credentials grant, except it's been specifically designed for **client-to-server scenarios**
(no user is involved in this flow): the client application sends a token request containing its credentials and gets back an access token it can use to query its own resources.

![Client credentials flow](choosing-the-right-flow/client-credentials-flow.png)

```http
POST /connect/token HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=s6BhdRkqt3&client_secret=gX1fBat3bV
```

```http
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token":"2YotnFZFEjr1zCsicMWpAA",
  "token_type":"bearer",
  "expires_in":3600
}
```

> [!NOTE]
> Unlike the resource owner password credentials grant, **client authentication is not optional** when using the client credentials grant and
> **the OpenIddict sserver will always reject unauthenticated token requests**,
> [as required by the OAuth 2.0 specification](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4.2).
>
> This means that **you CAN'T use the client credentials grant with public applications** like browser, 
> mobile or desktop applications, as they are not able to keep their credentials secret.

## Interactive flows

### Authorization code flow (recommended for new applications)

While the authorization code flow is probably the most complicated flow (as it involves both **user-agent redirections and backchannel communication**), it's
**the recommended flow for any scenario involving end users, whether they log in using a password, a PIN, a smart card or even an external provider**.
In return for its complexity, this flow has a great advantage when used in server-side applications: the `access_token` cannot be intercepted by the user agent.

There are basically 2 steps in the authorization code flow: the authorization request/response and the token request/response.

![Authorization code flow](choosing-the-right-flow/authorization-code-flow.png)

- **Step 1: the authorization request**

In this flow, the client application always initiates the authentication process by generating an authorization request including
the mandatory `response_type=code` parameter, its `client_id`, its `redirect_uri` and optionally, a `scope` and a `state` parameter
[that allows flowing custom data and helps mitigate XSRF attacks](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest).

> [!NOTE]
> In most cases, the client application will simply return a 302 response with a `Location` header to redirect the user agent to the authorization endpoint,
> but depending on the OpenID Connect client you're using, POST requests might also be supported to allow you to send large authorization requests.
> This feature [is usually implemented using an auto-post HTML form](https://github.com/aspnet/Security/pull/392).

```http
HTTP/1.1 302 Found
Location: https://server.example.com/authorize?response_type=code&client_id=s6BhdRkqt3&state=af0ifjsldkj&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb
```

```http
GET /connect/authorize?response_type=code&client_id=s6BhdRkqt3&state=af0ifjsldkj&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb HTTP/1.1
Host: server.example.com
```

The way the identity provider handles the authorization request is implementation-specific but in most cases, a consent form
is displayed to ask the user if he or she agrees to share his/her personal data with the client application.

![Consent form](choosing-the-right-flow/consent-form.png)

When the consent is given, the user agent is redirected back to the client application with **a unique and short-lived token**
named *authorization code* that the client will be able to exchange with an access token by sending a token request.

```http
HTTP/1.1 302 Found
Location: https://client.example.org/cb?code=SplxlOBeZQQYbYS6WxSbIA&state=af0ifjsldkj
```

> [!WARNING]
> To prevent XSRF/session fixation attacks, **the client application MUST ensure that the `state` parameter returned by the identity provider
> corresponds to the original `state`** and stop processing the authorization response if the two values don't match.
> [This is usually done by generating a non-guessable string and a corresponding correlation cookie](https://datatracker.ietf.org/doc/html/rfc6749#section-10.12).
>
> This mechanism is fully supported by the OpenIddict client (and cannot be disabled) but may not be supported by third-party clients.

- **Step 2: the token request**

When the client application gets back an authorization code, it must immediately reedem it for an access token by sending a `grant_type=authorization_code` token request.

> [!NOTE]
> To help the identity provider [mitigate counterfeit clients attacks](https://datatracker.ietf.org/doc/html/rfc6819#section-4.4.1.7), the original `redirect_uri` must also be sent.
>
> If the client application is a confidential application (i.e an application that has been assigned client credentials), authentication is required.

```http
POST /connect/token HTTP/1.1
Host: server.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA&redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb&client_id=s6BhdRkqt3&client_secret=gX1fBat3bV&scope=openid
```

```http
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token":"2YotnFZFEjr1zCsicMWpAA",
  "token_type":"bearer",
  "expires_in":3600
}
```

> [!NOTE]
> To increase security, additional parameters such as `code_challenge` and `code_challenge_method` can be specified to bind the authorization code
> that will be returned by the authorization endpoint to the original authorization request. This mechanism is known as
> [Proof Key for Code Exchange](../configuration/proof-key-for-code-exchange.md) and is fully supported by OpenIddict. 

### Implicit flow (not recommended for new applications)

The implicit flow is similar to the authorization code flow, **except there's no token request/response step**: the access token is directly returned
to the client application as part of the authorization response in the URI fragment (or in the request form when using `response_mode=form_post`).

> [!TIP]
> When using the OpenID Connect version of the implicit flow, an additional token called *identity token*
> is returned and can be used by client applications to retrieved standardized information about the user.

![Implicit flow](choosing-the-right-flow/implicit-flow.png)

```http
GET /connect/authorize?response_type=token&client_id=s6BhdRkqt3&redirect_uri=https%3A%2F%2Fclient.example.org%2Fcb&scope=openid&state=af0ifjsldkj&nonce=n-0S6_WzA2Mj HTTP/1.1
Host: server.example.com
```

```http
HTTP/1.1 302 Found
Location: https://client.example.org/cb#access_token=SlAV32hkKG&token_type=bearer&expires_in=3600&state=af0ifjsldkj
```

> [!CAUTION]
> Initially designed for browser applications, this flow is inherently less secure than the authorization code flow and doesn't support
> [Proof Key for Code Exchange](https://datatracker.ietf.org/doc/html/rfc7636). As such, using it in new applications is not recommended.

> [!WARNING]
> As for the authorization code flow, **the client application MUST ensure that the `state` parameter returned by the
> identity provider corresponds to the original `state`** to mitigate XSRF/session fixation attacks.

> [!CAUTION]
> When using the legacy OAuth 2.0 implicit flow (i.e `response_type=token`), **the client application MUST also ensure that the access token
> was not issued to another application to prevent [confused deputy attacks](https://stackoverflow.com/a/17439317/542757).**
> Unfortunately, no standard mechanism is provided in the OAuth 2.0 base specification to implement this security check.
>
> This is not a problem in the OpenID Connect version of the implicit flow as the `aud` claim returned in the cryptographically-signed
> JWT identity token can be used to check whether it corresponds to the `client_id` of the client application and detect such attacks.
