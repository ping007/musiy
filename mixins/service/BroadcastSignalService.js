export default {
  methods: {
    _BroadcastSignalService_query(channelId) {
      return this.$firestore
        .collection("broadcast_signals")
        .doc(channelId)
        .collection("signal");
    },
    async _BroadcastSignalService_signal(channelId, type) {
      return await this._BroadcastSignalService_query(channelId).add({
        type,
        createdAt: new Date(),
      });
    },
    async BroadcastSignalService_startSignal(channelId) {
      return await this._BroadcastSignalService_signal(channelId, "start");
    },
    async BroadcastSignalService_pauseSignal(channelId) {
      return await this._BroadcastSignalService_signal(channelId, "pause");
    },
    async BroadcastSignalService_endSignal(channelId) {
      return await this._BroadcastSignalService_signal(channelId, "end");
    },
    BroadcastSignalService_reave(channelId) {
      const projectId = process.env.VUE_APP_projectId;
      navigator.sendBeacon(`https://asia-northeast1-${projectId}.cloudfunctions.net/broadcast_signal_pause`, channelId);
    },
    BroadcastSignalService_observe(channelId, onSignal) {
      this._BroadcastSignalService_query(channelId)
        .orderBy("createdAt", "desc")
        .limit(1)
        .onSnapshot((signals) => {
          signals.docChanges().forEach((change) => {
            if (change.type === "added" && onSignal) {
              onSignal(change.doc.data().type);
            }
          });
        });
    }
  },
};
