# Introduction

## What's OpenIddict?

OpenIddict aims at providing a **simple and easy-to-use solution** to implement an **OpenID Connect server in any ASP.NET Core 1.x or 2.x application**.

OpenIddict is based on
**[AspNet.Security.OpenIdConnect.Server (codenamed ASOS)](https://github.com/aspnet-contrib/AspNet.Security.OpenIdConnect.Server)** to control the OpenID Connect authentication flow and can be used with any membership stack, **including [ASP.NET Core Identity](https://github.com/aspnet/Identity)**.

OpenIddict fully supports the **[code/implicit/hybrid flows](http://openid.net/specs/openid-connect-core-1_0.html)** and the **[client credentials/resource owner password grants](https://tools.ietf.org/html/rfc6749)**. You can also create your own custom grant types.

Note: OpenIddict natively supports **[Entity Framework Core](https://github.com/aspnet/EntityFramework)** and **[Entity Framework 6](https://github.com/aspnet/EntityFramework6)** out-of-the-box, but you can also provide your own stores.

> Note: **the OpenIddict 2.x packages are only compatible with ASP.NET Core 2.x**.
> If your application targets ASP.NET Core 1.x, use the OpenIddict 1.x packages.

## Why an OpenID Connect server?

Adding an OpenID Connect server to your application **allows you to support token authentication**.
It also allows you to manage all your users using local password or an external identity provider
(e.g. Facebook or Google) for all your applications in one central place,
with the power to control who can access your API and the information that is exposed to each client.
