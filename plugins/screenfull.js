import screenfull from "screenfull";
import Vue from "vue";
Object.defineProperty(Vue.prototype, "$screenfull", {
  get: () => screenfull
});
