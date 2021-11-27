import Vue from "vue";
import firebase from "firebase";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VUE_APP_apiKey,
  authDomain: process.env.VUE_APP_authDomain,
  databaseURL: process.env.VUE_APP_databaseURL,
  projectId: process.env.VUE_APP_projectId,
  storageBucket: process.env.VUE_APP_storageBucket,
  messagingSenderId: process.env.VUE_APP_messagingSenderId,
  appId: process.env.VUE_APP_appId,
  measurementId: process.env.VUE_APP_measurementId,
};
if (!firebase.apps.length) {
  const fireapp = firebase.initializeApp(firebaseConfig);
}

Object.defineProperty(Vue.prototype, "$firebase", {
  get: () => firebase,
});

Object.defineProperty(Vue.prototype, "$functions", {
  get: () => firebase.app().functions("asia-northeast1"),
});

Object.defineProperty(Vue.prototype, "$firestore", {
  get: () => firebase.firestore(),
});

export default firebase;
