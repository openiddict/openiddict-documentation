# Getting started

OpenIddict features three independent stacks:
  - A **server stack**, that allows creating an OAuth 2.0/OpenID Connect server instance that can be used with internal or external clients.
  The server stack can be used in both ASP.NET 4.6.2+ and ASP.NET Core 2.3+ applications. To get started, read
  [Creating your own server instance](creating-your-own-server-instance.md).

  - A **server stack with AdminUI**, that allows creating an OAuth 2.0/OpenID Connect server instance with a management portal for clients and users that can be used with internal or external clients.
    The server stack is compatible with ASP.NET Core 8+. To get started, read
  [Creating your own server instance with AdminUI](https://www.openiddictcomponents.com/articles/quick-start-openiddict-sso-solution-with-management-ui).

  - A **validation stack**, that allows implementing token authentication support for your ASP.NET 4.6.2+ and ASP.NET Core 2.3+ APIs.
   To get started, read [Implementing token validation in your APIs](implementing-token-validation-in-your-apis.md).

  - A **client stack**, that allows integrating with internal or external OAuth 2.0/OpenID Connect servers.
  The client stack can be used in ASP.NET 4.6.2+ or ASP.NET Core 2.3+ applications and can also be used
  in non-web applications (e.g Android, iOS, Linux, macOS and Windows applications). To get started, read
  [Integrating with a remote server instance](integrating-with-a-remote-server-instance.md).

> [!NOTE]
> The stacks can be used together or independently, depending on your specific scenario.
