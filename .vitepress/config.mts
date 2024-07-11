import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "OpenIddict documentation",
  description: "Documentation for the OpenIddict project",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Introduction',
        link: 'introduction/index.md',
        activeMatch: 'introduction/'
      },
      {
        text: 'Guides',
        link: 'guides/index.md',
        activeMatch: 'guides/'
      },
      {
        text: 'Configuration',
        link: 'configuration/index.md',
        activeMatch: 'configuration/'
      },
      {
        text: 'Integrations',
        link: 'integrations/index.md',
        activeMatch: 'integrations/'
      },
      { text: 'Website', link: 'https://openiddict.com/' },
      { text: 'Samples', link: 'https://github.com/openiddict/openiddict-samples' },
      { text: 'Changelog', link: 'https://github.com/openiddict/openiddict-core/releases' }
    ],

    sidebar: {
      '/introduction': {
        items: [
          {
            text: 'External resources',
            items: [
              { text: 'OAuth 2.0 specification', link: 'https://tools.ietf.org/html/rfc6749' },
              { text: 'OpenID Connect specification', link: 'https://openid.net/specs/openid-connect-core-1_0.html' }
            ]
          }
        ]
      },
      '/guides/': {
        items: [
          {
            text: 'Getting started',
            link: 'guides/getting-started/index.md',
            items: [
              { text: 'Creating your own server instance', link: 'guides/getting-started/creating-your-own-server-instance.md' },
              { text: 'Implementing token validation in your APIs', link: 'guides/getting-started/implementing-token-validation-in-your-apis.md' },
              { text: 'Integrating with a remote server instance', link: 'guides/getting-started/integrating-with-a-remote-server-instance.md' }
            ]
          },
          {
            text: 'Choosing the right flow',
            link: 'guides/choosing-the-right-flow.md'
          },
          {
            text: 'Migration guides',
            items: [
              { text: 'Migration from 2.0 to 3.0', link: 'guides/migration/20-to-30.md' },
              { text: 'Migration from 3.0 to 4.0', link: 'guides/migration/30-to-40.md' },
              { text: 'Migration from 4.0 to 5.0', link: 'guides/migration/40-to-50.md' }
            ]
          },
          {
            text: 'Contributing a new Web provider',
            link: 'guides/contributing-a-new-web-provider.md'
          },
          {
            text: 'External resources',
            items: [
              { text: 'OAuth 2.0 specification', link: 'https://tools.ietf.org/html/rfc6749' },
              { text: 'OpenID Connect specification', link: 'https://openid.net/specs/openid-connect-core-1_0.html' }
            ]
          }
        ]
      },
      '/configuration/': {
        items: [
          { text: 'Application permissions', link: 'configuration/application-permissions.md' },
          { text: 'Authorization storage', link: 'configuration/authorization-storage.md' },
          { text: 'Claim destinations', link: 'configuration/claim-destinations.md' },
          { text: 'Encryption and signing credentials', link: 'configuration/encryption-and-signing-credentials.md' },
          { text: 'Proof Key for Code Exchange', link: 'configuration/proof-key-for-code-exchange.md' },
          { text: 'Token formats', link: 'configuration/token-formats.md' },
          { text: 'Token storage', link: 'configuration/token-storage.md' },
          {
            text: 'External resources',
            items: [
              { text: 'OAuth 2.0 specification', link: 'https://tools.ietf.org/html/rfc6749' },
              { text: 'OpenID Connect specification', link: 'https://openid.net/specs/openid-connect-core-1_0.html' }
            ]
          }
        ]
      },
      '/integrations/': {
        items: [
          { text: 'Entity Framework', link: 'integrations/entity-framework.md' },
          { text: 'Entity Framework Core', link: 'integrations/entity-framework-core.md' },
          { text: 'MongoDB', link: 'integrations/mongodb.md' },
          { text: 'Quartz.NET', link: 'integrations/quartz.md' },
          {
            text: 'External resources',
            items: [
              { text: 'OAuth 2.0 specification', link: 'https://tools.ietf.org/html/rfc6749' },
              { text: 'OpenID Connect specification', link: 'https://openid.net/specs/openid-connect-core-1_0.html' }
            ]
          }
        ]
      }
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/openiddict/openiddict-core' }
    ],

    externalLinkIcon: true,
    logo: '/logo.png',

    editLink: {
      pattern: 'https://github.com/openiddict/openiddict-documentation/edit/dev/:path',
      text: 'Edit this page on GitHub'
    },

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Proudly powered by VitePress.'
    }
  }
})
