import { defineConfig } from "vitepress"
import { nav as enNav, sidebar as enSidebar } from "./locales/en"
import { nav as zhNav, sidebar as zhSidebar } from "./locales/zh"

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "OpenIddict",
  description: "Documentation for the OpenIddict project",
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    socialLinks: [
      { icon: "github", link: "https://github.com/openiddict/openiddict-core" },
      { icon: "twitter", link: "https://x.com/openiddict" }
    ],

    outline: [2, 4],
    externalLinkIcon: true,
    logo: "/logo.png",

    editLink: {
      pattern: "https://github.com/openiddict/openiddict-documentation/edit/dev/:path",
      text: "Edit this page on GitHub"
    },
    docFooter: {
      prev: false,
      next: false,
    },
    search: {
      provider: "local"
    },

    footer: {
      message: "Proudly powered by VitePress."
    }
  },
  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: enNav,
        sidebar: enSidebar
      }
    },
    zh: {
      label: "简体中文",
      lang: "zh",
      link: "/zh/",
      themeConfig: {
        nav: zhNav,
        sidebar: zhSidebar
      }
    }
  }
})
