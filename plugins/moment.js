import moment from "moment";
import Vue from "vue";
Object.defineProperty(Vue.prototype, "$moment", {
  get: () => moment
});
