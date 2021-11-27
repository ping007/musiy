import axios from "axios";

const NoLoginStreamingTestMode = {
  enabled: !!process.env.noLoginStreamingTestMode,
  testPagePaths: [
    "/artists/broadcasthost",
    "/artists/broadcasthost-hd",
    "/fans/broadcastaudience",
    "/fans/broadcastaudience-hd",
    "/streaming-test-agora-host",
    "/streaming-test-agora-audience",
  ],
  broadcast: {
    broadcastId: "no-login-streaming-test",
    userImageId: "lchbwnaryfyijvixg4zv",
    username: "test-streaming-user",
  },
  imageFluxChannelManagement: {
    getChannel: async () => {
      const ssl = !!process.env.ssl;
      const protocol = ssl ? "https" : "http";
      const port = ssl ? 3480 : 3080;
      const res = await axios.get(`${protocol}://${location.hostname}:${port}/get-channel/no-login-streaming-test`);
      return res.data;
    },
  },
  get comment() {
    const contents = [
      "こんにちは。",
      "さようなら。",
      "ただいま。",
      "おかえりなさい。",
      "素敵ですね！",
      "長めの文章が投稿された時にどんな表示になるかのテストのためのコメントです。"
    ];
    return {
      id: Math.floor(Math.random() * 100),
      userId: Math.floor(Math.random() * 100),
      userImageId: "lchbwnaryfyijvixg4zv",
      username: Math.random().toString(32).substring(2),
      content: contents[Math.floor(Math.random() * contents.length)],
      deletable: Math.round(Math.random()),
      isDeleted: false,
    };
  },
};

export default NoLoginStreamingTestMode;
