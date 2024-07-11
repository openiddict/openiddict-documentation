# Getting started

OpenIddict features three independent stacks:
  - A **server stack**, that allows creating an OAuth 2.0/OpenID Connect server instance that can be used with internal or external clients.
  The server stack can be used in both ASP.NET 4.6.1+ and ASP.NET Core 2.1+ applications. To get started, read
  [Creating your own server instance](creating-your-own-server-instance.md).

  - A **validation stack**, that allows implementing token authentication support for your ASP.NET 4.6.1+ and ASP.NET Core 2.1+ APIs.
   To get started, read [Implementing token validation in your APIs](implementing-token-validation-in-your-apis.md).

  - A **client stack**, that allows integrating with internal or external OAuth 2.0/OpenID Connect servers. The client stack can be used in
  ASP.NET 4.6.1+ or ASP.NET Core 2.1+ applications and can also be used in non-web applications (e.g Windows/Linux console applications
  or Windows desktop applications).  To get started, read
  [Integrating with a remote server instance](integrating-with-a-remote-server-instance.md).

> [!NOTE]
> The three stacks can be used together or independently, depending on your specific scenario.
