# Introduction

## What's OpenIddict?

OpenIddict was born in late 2015 and was initially based on **[AspNet.Security.OpenIdConnect.Server](https://github.com/aspnet-contrib/AspNet.Security.OpenIdConnect.Server)**
(codenamed ASOS), a low-level OpenID Connect server middleware forked from OWIN/Katana's `OAuthAuthorizationServerMiddleware`. In 2020, ASOS was merged into OpenIddict 3.0
to form a unified stack under the OpenIddict umbrella, while still offering an easy-to-use approach for new users and a low-level experience for advanced users.

## Why an OpenID Connect server?

Adding an OpenID Connect server to your application **allows you to support token authentication**.
It also allows you to manage all your users using local password or an external identity provider (e.g. Facebook or Google) for all your
applications in one central place, with the power to control who can access your API and the information that is exposed to each client.
