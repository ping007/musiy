import Vue from "vue";

const mixin = {
  computed: {
    isMobileDevice() {
      return this.$vuetify.breakpoint.name === "xs" || this.$vuetify.breakpoint.name === "sm";
    }
  }
};

Vue.mixin(mixin);
