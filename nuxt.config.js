import fs from "fs";
import path from "path";
import colors from "vuetify/es5/util/colors";
import { NoLoginPagePaths } from "./constant.js";
import NoLoginStreamingTestMode from "./no-login-streaming-test/no-login-streaming-test-mode.js";

export default {
  mode: "spa",
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: "%s - " + process.env.npm_package_name,
    title: process.env.npm_package_name || "",
    htmlAttrs: {
      lang: "ja"
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || "",
      },
      { hid: "og:title", property: "og:title", content: "musiy" },
      { hid: "og:type", property: "og:type", content: "website" },
      { hid: "og:url", property: "og:url", content: "https://musiy.fan" },
      { hid: "og:image", property: "og:image", content: "https://musiy.fan/images/logo_icon.png" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css?family=Teko",
      },
    ],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "~/plugins/route",
    "~/plugins/uuid",
    "~/plugins/vue2-touch-events",
    "~/plugins/firebase",
    "~/plugins/moment",
    "~/plugins/persistedstate",
    "~/plugins/screenfull",
    "~/plugins/socialsharing",
    "~/plugins/vueinview"
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    "@nuxtjs/eslint-module",
    "@nuxtjs/vuetify",
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    "@nuxtjs/axios",
    "@nuxtjs/pwa",
    // Doc: https://github.com/nuxt-community/dotenv-module
    [
      "@nuxtjs/dotenv",
      {
        filename:
          process.env.NODE_ENV !== "production"
            ? "./config/.env.dev"
            : "./config/.env.prod",
      },
    ],
    "nuxt-user-agent",
    ["vuetify-dialog/nuxt", { property: "$dialog" }]
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: { baseURL: process.env.BASE_URL || "http://localhost:3000" },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    treeShake: true,
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
        },
      },
    },
  },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        use: "file-loader",
        exclude: /(node_modules)/,
      });
    },
    terser: {
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production",
        },
      },
    },
  },
  /*
   ** Router optional meta params
   */
  router: {
    extendRoutes(routes, resolve) {
      routes.forEach((route) => {
        if (
          !NoLoginPagePaths.find((noLoginPagePath) => {
            return noLoginPagePath === route.path;
          })
        ) {
          route.meta = {
            requiresAuth: true,
          };
        }
        if (
          process.env.NO_LOGIN_STREAMING_TEST_MODE &&
          NoLoginStreamingTestMode.testPagePaths.find((testPagePath) => {
            return testPagePath === route.path;
          })
        ) {
          route.meta = {
            requiresAuth: false,
          };
        }
      });
    },
  },
  env: {
    ssl: !!process.env.SSL,
    noLoginStreamingTestMode: !!process.env.NO_LOGIN_STREAMING_TEST_MODE,
  },
  server: (() => process.env.SSL ? ({
    host: "0.0.0.0",
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "certificate/localhost+2-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "certificate/localhost+2.pem")),
    },
  }) : undefined)(),
};
