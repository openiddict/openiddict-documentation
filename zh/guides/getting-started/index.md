# 入门指南

OpenIddict 包含三个独立的组件栈：
  - **服务器栈**，允许创建可用于内部或外部客户端的 OAuth 2.0/OpenID Connect 服务器实例。
  服务器栈可以在 ASP.NET 4.6.1+ 和 ASP.NET Core 2.1+ 应用程序中使用。要开始使用，请阅读
  [创建您自己的服务器实例](creating-your-own-server-instance.md)。

  - **验证栈**，允许为您的 ASP.NET 4.6.1+ 和 ASP.NET Core 2.1+ API 实现令牌认证支持。
  要开始使用，请阅读 [在您的 API 中实现令牌验证](implementing-token-validation-in-your-apis.md)。

  - **客户端栈**，允许与内部或外部的 OAuth 2.0/OpenID Connect 服务器集成。
  客户端栈可以在 ASP.NET 4.6.1+ 或 ASP.NET Core 2.1+ 应用程序中使用，也可以在
  非 Web 应用程序中使用（例如 Android、iOS、Linux、macOS 和 Windows 应用程序）。要开始使用，请阅读
  [与远程服务器实例集成](integrating-with-a-remote-server-instance.md)。

> [!NOTE]
> 这三个组件栈可以根据您的具体场景一起使用或独立使用。
