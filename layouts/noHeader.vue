<template>
  <v-app>
    <v-content :class="!isUserLoggedIn && 'parent-content'">
      <v-container id="mainContent">
        <nuxt />
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        {
          icon: "mdi-apps",
          title: "Welcome",
          to: "/"
        },
        {
          icon: "mdi-chart-bubble",
          title: "Inspire",
          to: "/inspire"
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "MUSIY"
    };
  },
  computed: {
    ...mapGetters("user", ["isUserLoggedIn"])
  },
};
</script>
<style>
html {
  touch-action: manipulation;
}
</style>
<style scoped>
.parent-content {
  align-items: center;
}
.app-bar {
  background-color: #ffffff !important;
}
.app-bar-menu-button {
  position: fixed;
  right: 20px;
  top: 2px;
}
#mainContent {
  padding: 0px !important;
}
</style>
