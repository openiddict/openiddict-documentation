import DefaultTheme from 'vitepress/theme'
import './custom.css'

export default {
  extends: DefaultTheme,

  enhanceApp({ router }) {
    router.onBeforeRouteChange = (to: string) => {
      if (to.startsWith("/errors")) {
        setTimeout(() => { router.go("/"); });
        return false;
      }

      return true;
    }
  }
}
