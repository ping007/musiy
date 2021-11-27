<template>
  <div>
    <div class="content">
      <h3>Agora Streaming Audience</h3>
      <v-container>
        <v-row no-gutters>
          <v-col class="col" cols="12" sm="6">
            <v-text-field v-model="userName" label="UserName" />
          </v-col>
          <v-col class="col" cols="12" sm="6">
            <v-text-field v-model="channelName" label="ChannelName" />
          </v-col>
        </v-row>
      </v-container>
      <div id="subscribing-video" class="video"></div>
      <div>
        <v-btn :disabled="isJoin" @click="join">Join</v-btn>
        <v-btn :disabled="!isJoin" @click="leave">Leave</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import AgoraConnectionService from "~/mixins/service/AgoraConnectionService";
export default {
  layout: "noHeader",
  mixins: [AgoraConnectionService],
  data () {
    return {
      agoraConnection: null,
      userName: "listener",
      channelName: "live-01",
      isJoin: false
    };
  },
  mounted () {
    this.initConnection();
  },
  methods: {
    initConnection () {
      this.agoraConnection = this.AgoraConnectionService_getSubscriberClient("subscribing-video");
    },
    async join () {
      if (this.agoraConnection) {
        const uid = await this.agoraConnection.subscribe(this.channelName, this.userName);
        console.log("connect uid = ", uid);
        this.isJoin = true;
      }
    },
    async leave () {
      if (this.agoraConnection) {
        await this.agoraConnection.disconnect();
        this.isJoin = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.content {
  text-align: center;
}
.col {
  padding: 5px;
}
.video {
  margin: 10px auto;
  width: 100vw;
  max-width: 560px;
  height: 75vw;
  max-height: 420px;
}
</style>
