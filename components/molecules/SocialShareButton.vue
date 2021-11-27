<template>
  <div>
    <v-bottom-sheet v-model="sheet">
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon class="mx-1" color="#9fadaa" large>mdi-share-variant</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-snackbar
          v-model="isShowSuccessSnackbar"
          top
          :multi-line="true"
          :color="'success'"
          :timeout="3000"
        >
          <span v-text="successStr"></span>
        </v-snackbar>
        <v-subheader>共有</v-subheader>
        <v-list-item>
          <v-list-item-avatar>
            <font-awesome-icon icon="clipboard" size="2x" />
          </v-list-item-avatar>
          <v-list-item-title>
            <span style="text-decoration: underline" @click="doCopy">クリップボードへコピー</span>
          </v-list-item-title>
        </v-list-item>
        <ShareNetwork
          v-for="network in networks"
          :key="network.network"
          :network="network.network"
          :style="{ backgroundColor: network.color }"
          :url="getUrl()"
          :title="title"
          :description="description"
          :quote="quote"
          :hashtags="getTags()"
          :twitter-user="twitterUser"
          :media="media"
        >
          <v-list-item>
            <v-list-item-avatar>
              <font-awesome-icon :icon="network.icon" size="2x" />
            </v-list-item-avatar>
            <v-list-item-title>
              <span>{{ network.name }}</span>
            </v-list-item-title>
          </v-list-item>
        </ShareNetwork>
      </v-list>
    </v-bottom-sheet>
  </div>
</template>

<script>
import { faEnvelope, faClipboard } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
library.add(fab, faEnvelope, faClipboard);

export default {
  name: "SocialShareButton",
  props: {
    url: {
      type: String,
      default: "",
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
      required: false,
    },
    quote: {
      type: String,
      default: "",
      required: false,
    },
    tag: {
      type: String,
      default: "",
      required: false,
    },
    twitterUser: {
      type: String,
      default: "",
      required: false,
    },
    media: {
      type: String,
      default: "",
      required: false,
    },
  },
  data() {
    return {
      sheet: false,
      networks: [
        {
          network: "email",
          name: "Email",
          icon: ["fas", "envelope"],
          color: "#333333",
        },
        {
          network: "facebook",
          name: "Facebook",
          icon: ["fab", "facebook-f"],
          color: "#1877f2",
        },
        {
          network: "line",
          name: "Line",
          icon: ["fab", "line"],
          color: "#00c300",
        },
        {
          network: "twitter",
          name: "Twitter",
          icon: ["fab", "twitter"],
          color: "#1da1f2",
        },
      ],
      isShowSuccessSnackbar: false,
      successStr: "",
    };
  },
  methods: {
    getTags() {
      // ShareNetworkはcomma-separatedとなっているので一旦splitしてから前後スペースを取り除く
      return this.tag
        .split(",")
        .concat(["musiy"])
        .filter(Boolean)
        .map((value) => {
          return value.replace(/\s+/g, "");
        })
        .join(",");
    },
    getUrl() {
      if (!this.url) {
        return location.origin + this.$route.path;
      }
      return this.url;
    },
    doCopy() {
      navigator.clipboard.writeText(this.getUrl()).then(() => {
        this.isShowSuccessSnackbar = true;
        this.successStr = "クリップボードにコピーされました。";
      });
    },
  },
};
</script>

<style scoped>
.v-list {
  height: 350px;
  overflow-y: auto;
}
</style>
