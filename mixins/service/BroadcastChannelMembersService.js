export default {
  data() {
    return {
      BroadcastChannelMembersService_members: []
    };
  },
  methods: {
    _BroadcastChannelMembersService_query(channelId) {
      return this.$firestore
        .collection("broadcast_channel_members")
        .doc(channelId)
        .collection("member");
    },
    async BroadcastChannelMembersService_addMember(channelId, userId) {
      await this._BroadcastChannelMembersService_query(channelId).doc(userId).set({ userId });
    },
    BroadcastChannelMembersService_removeMember(channelId, userId) {
      const projectId = process.env.VUE_APP_projectId;
      navigator.sendBeacon(`https://asia-northeast1-${projectId}.cloudfunctions.net/broadcast_channel_member_remove`, JSON.stringify({ channelId, userId }));
    },
    BroadcastChannelMembersService_observe(channelId, onReceive) {
      this._BroadcastChannelMembersService_query(channelId).onSnapshot((response) => {
        if (onReceive) {
          response.docChanges().forEach((docChange) => {
            const member = docChange.doc.data();
            if (docChange.type === "added") {
              this.BroadcastChannelMembersService_members.push(member);
            } else if (docChange.type === "modified") {
              // do nothing.
            } else if (docChange.type === "removed") {
              this.BroadcastChannelMembersService_members = this.BroadcastChannelMembersService_members.filter(c => c.userId !== member.userId);
            }
          });
          onReceive(this.BroadcastChannelMembersService_members);
        }
      });
    }
  },
};
