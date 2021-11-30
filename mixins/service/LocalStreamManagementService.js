import hall from "~/assets/impulse-responses/hall.js";

export default {
  data: () => ({
    videoElement: null,
    localStream: null,
    localStreamCreated: 0,
    micDevices: [],
    micDevice: { deviceId: null, label: null },
    cameraDevices: [],
    cameraDevice: { deviceId: null, label: null },
    frameRate: 30,
    agcSupported: false,
    agc: false,
    aecSupported: false,
    aec: false,
    ansSupported: false,
    ans: false,
    micInputLevelObserverId: null,
    micInputRecordedMaxHexLevel: 0,
    micInputLevel: 0,
    volumeNode: null,
    micVolume: 100,
    reverbDepthNode: null,
    reverbDepth: 20,
  }),
  methods: {
    async LocalStreamManagementService_initLocalStream(videoElement) {
      this.videoElement = videoElement;
      try {
        // getUserMediaを呼ばないとデバイス一覧が取れないというSafariの仕様に従って一瞬だけ作って破棄する
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        // 入力デバイスの初期設定
        const devices = await navigator.mediaDevices.enumerateDevices();
        this.micDevices = devices.filter((device) => {
          return device.kind === "audioinput";
        });
        this.micDevice = this.micDevices[0];
        this.cameraDevices = devices.filter((device) => {
          return device.kind === "videoinput";
        });
        this.cameraDevice = this.cameraDevices[0];
        // オーディオ関連設定の可否設定
        const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
        this.agcSupported = supportedConstraints.autoGainControl;
        this.aecSupported = supportedConstraints.echoCancellation;
        this.ansSupported = supportedConstraints.noiseSuppression;
      } catch (e) {
        console.log(e);
        if (e) {
          if (e.name === "NotAllowedError") {
            alert("マイクまたはカメラの使用が許可されていません。\nブラウザの設定をご確認ください。");
          } else if (e.name === "TypeError" && e.message === "Cannot read property 'getUserMedia' of undefined") {
            alert("http接続ではマイクやカメラを使用することはできません。\nhttpsで接続し直してください。");
          } else {
            alert(e);
          }
        }
      }
    },
    async LocalStreamManagementService_createLocalStream() {
      // 現在のlocalStreamを破棄
      if (this.localStream) {
        const tracks = this.localStream.getTracks();
        tracks.forEach((track) => {
          track.stop();
          this.localStream.removeTrack(track);
        });
        this.localStream = null;
        this.videoElement.srcObject = null;
      }
      // 入力レベルの監視を解除
      if (this.micInputLevelObserverId) {
        clearInterval(this.micInputLevelObserverId);
        this.micInputLevelObserverId = null;
      }
      // (ひとまず動画のみの)localStream作成
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: this.cameraDevice.deviceId,
          width: 1920,
          height: 1080,
          frameRate: this.frameRate,
        },
      });
      // 音声加工開始
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: this.micDevice.deviceId,
          autoGainControl: this.agc,
          echoCancellation: this.aec,
          noiseSuppression: this.ans,
        },
      });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const source = ctx.createMediaStreamSource(audioStream);
      const destination = ctx.createMediaStreamDestination();
      // 音量ノード
      this.volumeNode = ctx.createGain();
      this.volumeNode.gain.value = this.micVolume / 100;
      // 入力レベル監視ノード
      const analyserNode = ctx.createAnalyser();
      analyserNode.maxDecibels = 0;
      analyserNode.minDecibels = -70;
      this.micInputLevelObserverId = setInterval(() => {
        const freqBinCount = analyserNode.frequencyBinCount;
        const freqs = new Uint8Array(freqBinCount);
        analyserNode.getByteFrequencyData(freqs);
        const micInputMaxHexLevel = freqs.reduce((a, b) => Math.max(a, b));// 0 ~ 255
        if (micInputMaxHexLevel > this.micInputRecordedMaxHexLevel) {
          this.micInputRecordedMaxHexLevel = micInputMaxHexLevel;
          console.log("mic input max hex level = " + this.micInputRecordedMaxHexLevel);
        }
        this.micInputLevel = ~~(micInputMaxHexLevel * (100 / 255));
      }, 125);
      // リバーブノード
      const reverbNode = ctx.createConvolver();
      const byteString = atob(hall.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      // SafariがdecodeAudioDataのawaitに対応していないためcallbackで対応する
      ctx.decodeAudioData(ab, (buffer) => {
        reverbNode.buffer = buffer;
      });
      this.reverbDepthNode = ctx.createGain();
      this.reverbDepthNode.gain.value = this.reverbDepth / 100;
      // 各ノードの接続
      source.connect(this.volumeNode).connect(analyserNode).connect(destination);
      analyserNode.connect(reverbNode).connect(this.reverbDepthNode).connect(destination);
      // 加工後の出力音声を動画に合流させる
      this.localStream.addTrack(destination.stream.getAudioTracks()[0]);
      // videoタグにlocalStreamを充てがう
      this.videoElement.srcObject = this.localStream;
      // localStream作成完了通知を発火する
      this.localStreamCreated++;
    },
    LocalStreamManagementService_changeMicVolume() {
      if (this.volumeNode) {
        this.volumeNode.gain.value = this.micVolume / 100;
      }
    },
    LocalStreamManagementService_changeReverbDepth() {
      if (this.reverbDepthNode) {
        this.reverbDepthNode.gain.value = this.reverbDepth / 100;
      }
    },
    async LocalStreamManagementService_changeMicDevice(deviceId) {
      this.micDevice = this.micDevices.find((device) => {
        return device.deviceId === deviceId;
      });
      await this.LocalStreamManagementService_createLocalStream();
    },
    async LocalStreamManagementService_changeCameraDevice(deviceId) {
      this.cameraDevice = this.cameraDevices.find((device) => {
        return device.deviceId === deviceId;
      });
      await this.LocalStreamManagementService_createLocalStream();
    },
    LocalStreamManagementService_changeFrameRate(frameRate) {
      if (this.localStream) {
        this.localStream.getVideoTracks()[0].applyConstraints({ frameRate });
      }
    },
  },
};
