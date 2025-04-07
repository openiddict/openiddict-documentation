export const nav = [
  { text: "首页", link: "/zh/" },
  {
    text: "介绍",
    link: "/zh/introduction",
    activeMatch: "^/zh/introduction"
  },
  {
    text: "指南",
    link: "/zh/guides/",
    activeMatch: "^/zh/guides/"
  },
  {
    text: "配置",
    link: "/zh/configuration/",
    activeMatch: "^/zh/configuration/"
  },
  {
    text: "集成",
    link: "/zh/integrations/",
    activeMatch: "^/zh/integrations/"
  },
  { text: "官网", link: "https://openiddict.com/" },
  { text: "示例", link: "https://github.com/openiddict/openiddict-samples" },
  { text: "更新日志", link: "https://github.com/openiddict/openiddict-core/releases" }
]

export const sidebar = {
  "/zh/introduction": {
    items: [
      {
        text: "外部资源",
        items: [
          { text: "OAuth 2.0 规范", link: "https://datatracker.ietf.org/doc/html/rfc6749" },
          { text: "OpenID Connect 规范", link: "https://openid.net/specs/openid-connect-core-1_0.html" }
        ]
      }
    ]
  },
  "/zh/guides/": {
    items: [
      {
        text: "入门指南",
        link: "/zh/guides/getting-started/",
        items: [
          { text: "创建自己的服务器实例", link: "/zh/guides/getting-started/creating-your-own-server-instance" },
          { text: "在 API 中实现令牌验证", link: "/zh/guides/getting-started/implementing-token-validation-in-your-apis" },
          { text: "集成远程服务器实例", link: "/zh/guides/getting-started/integrating-with-a-remote-server-instance" }
        ]
      },
      {
        text: "选择合适的流程",
        link: "/zh/guides/choosing-the-right-flow"
      },
      {
        text: "迁移指南",
        items: [
          { text: "从 2.0 迁移到 3.0", link: "/zh/guides/migration/20-to-30" },
          { text: "从 3.0 迁移到 4.0", link: "/zh/guides/migration/30-to-40" },
          { text: "从 4.0 迁移到 5.0", link: "/zh/guides/migration/40-to-50" },
          { text: "从 5.0 迁移到 6.0", link: "/zh/guides/migration/50-to-60" }
        ]
      },
      {
        text: "贡献新的 Web 提供程序",
        link: "/zh/guides/contributing-a-new-web-provider"
      },
      {
        text: "外部资源",
        items: [
          { text: "OAuth 2.0 规范", link: "https://datatracker.ietf.org/doc/html/rfc6749" },
          { text: "OpenID Connect 规范", link: "https://openid.net/specs/openid-connect-core-1_0.html" }
        ]
      }
    ]
  },
  "/zh/configuration/": {
    items: [
      { text: "应用程序权限", link: "/zh/configuration/application-permissions" },
      { text: "授权存储", link: "/zh/configuration/authorization-storage" },
      { text: "声明目标", link: "/zh/configuration/claim-destinations" },
      { text: "加密和签名凭据", link: "/zh/configuration/encryption-and-signing-credentials" },
      { text: "代码交换证明密钥", link: "/zh/configuration/proof-key-for-code-exchange" },
      { text: "推送授权请求", link: "/zh/configuration/pushed-authorization-requests" },
      { text: "令牌格式", link: "/zh/configuration/token-formats" },
      { text: "令牌存储", link: "/zh/configuration/token-storage" },
      {
        text: "外部资源",
        items: [
          { text: "OAuth 2.0 规范", link: "https://datatracker.ietf.org/doc/html/rfc6749" },
          { text: "OpenID Connect 规范", link: "https://openid.net/specs/openid-connect-core-1_0.html" }
        ]
      }
    ]
  },
  "/zh/integrations/": {
    items: [
      {
        text: "Web 主机",
        items: [
          { text: "ASP.NET Core", link: "/zh/integrations/aspnet-core" }
        ]
      },
      {
        text: "令牌格式",
        items: [
          { text: "ASP.NET Core 数据保护", link: "/zh/integrations/aspnet-core-data-protection" }
        ]
      },
      {
        text: "对象关系映射器和数据库",
        items: [
          { text: "Entity Framework", link: "/zh/integrations/entity-framework" },
          { text: "Entity Framework Core", link: "/zh/integrations/entity-framework-core" },
          { text: "MongoDB", link: "/zh/integrations/mongodb" }
        ]
      },
      { text: "Quartz.NET", link: "/zh/integrations/quartz" },
      { text: "操作系统", link: "/zh/integrations/operating-systems" },
      { text: "System.Net.Http", link: "/zh/integrations/system-net-http" },
      { text: "Web 提供程序", link: "/zh/integrations/web-providers" },
      {
        text: "外部资源",
        items: [
          { text: "OAuth 2.0 规范", link: "https://datatracker.ietf.org/doc/html/rfc6749" },
          { text: "OpenID Connect 规范", link: "https://openid.net/specs/openid-connect-core-1_0.html" }
        ]
      }
    ]
  }
} 