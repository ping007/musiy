<template>
  <div class="upload-music-file">
    <v-container class="py-4">
      <v-row class="upload-music-file-row" align="center" justify="center">
        <v-card
          v-if="!uploadEnd&&!uploading"
          class="ma-2"
          :width="'100vw'"
          height="240px"
          dark
          color="grey"
        >
          <v-row
            v-if="!uploadEnd&&!uploading"
            class="file-select-area"
            align="center"
            justify="center"
            @click="selectFile"
          >
            <v-icon medium dark>mdi-plus</v-icon>
            <span v-text="'音楽ファイルを追加'"></span>
          </v-row>
        </v-card>
        <audio v-if="uploadEnd" :width="'100%'" controls>
          <source :src="mp3Url" type="audio/mp3" />
          <source :src="wavUrl" type="audio/wav" />
          <source :src="aacUrl" type="audio/aac" />
        </audio>
        <v-icon
          v-if="uploadEnd"
          class="close-icon"
          large
          color="red"
          @click="deleteMusic()"
        >mdi-close-circle</v-icon>
      </v-row>
      <v-row align="center" justify="center">
        <input
          id="musicFile"
          ref="uploadInput"
          type="file"
          name="file"
          accept="audio/*"
          :multiple="false"
          :tabindex="-1"
          @change="detectFiles($event)"
        />
        <v-progress-circular
          v-if="uploading && !uploadEnd"
          :size="96"
          :width="15"
          :rotate="360"
          :value="progressUpload"
          color="rgb(231, 64, 89)"
        >{{ progressUpload }}%</v-progress-circular>
      </v-row>
    </v-container>
    <v-snackbar
      v-model="isShowErrorSnackbar"
      top
      :multi-line="true"
      :color="'error'"
      :timeout="3000"
    >
      <span v-text="errorStr"></span>
    </v-snackbar>
  </div>
</template>

<script>
import axios from "~/plugins/axios";
import { Cloudinary } from "~/constant";
import CloudinaryDao from "~/mixins/dao/CloudinaryDao";
export default {
  name: "UploadMusicFile",
  mixins: [CloudinaryDao],
  model: {
    prop: "targetMusicURL",
    event: "downloadURL",
  },
  props: {
    targetMusicURL: {
      type: String,
      default: "",
    },
    musicFileName: {
      type: String,
      default: "",
    },
    storagePath: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      progressUpload: 0,
      fileName: "",
      uploadTask: "",
      uploading: false,
      isShowErrorSnackbar: false,
      errorStr: "",
      musicObject: {
        musicId: undefined,
      },
      cloudinary: Cloudinary,
    };
  },
  computed: {
    clUrl() {
      return `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/video/upload`;
    },
    mp3Url() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/video/upload/${this.musicObject.musicId}.mp3`;
    },
    wavUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/video/upload/${this.musicObject.musicId}.wav`;
    },
    aacUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/video/upload/${this.musicObject.musicId}.aac`;
    },
    uploadEnd() {
      return (
        this.musicObject.musicId !== null &&
        this.musicObject.musicId !== undefined &&
        this.musicObject.musicId !== ""
      );
    },
  },
  created() {
    if (this.musicFileName && this.musicFileName !== "") {
      this.fileName = this.musicFileName;
      this.musicObject.musicId = this.musicFileName.split(".")[0];
    }
  },
  methods: {
    selectFile() {
      this.$refs.uploadInput.click();
    },
    async detectFiles(e) {
      const fileList = e.target.files || e.dataTransfer.files;
      const file = fileList[0];
      if (!file) {
        this.isShowErrorSnackbar = true;
        this.errorStr = "ファイルの取得に失敗しました。";
      } else if (file.size > 100 * 1024 * 1024) {
        this.isShowErrorSnackbar = true;
        this.errorStr = "登録できるファイルは100MBまでです。";
      } else {
        await this.upload(file);
      }
    },
    async upload(file) {
      const user = this.$store.state.user.user;
      const fileName = file.name.split(".")[0];
      const fileExtension = file.name.split(".")[1];
      this.fileName = fileName + "." + fileExtension;
      this.uploading = true;
      try {
        const config = {
          onUploadProgress: (progressEvent) => {
            this.progressUpload = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // console.log(this.progressUpload);
          },
        };
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", this.cloudinary.uploadPreset);
        formData.append("folder", user.userId + "/musics");
        formData.append("tags", "gs-vue,gs-vue-uploaded");
        // Execute api
        const res = await axios.put(this.clUrl, formData, config);
        if (res.data && res.data.public_id && res.data.secure_url) {
          console.log("res.data:", res.data);
          this.musicObject.musicId = res.data.public_id;
          this.musicObject.fileExtension = fileExtension;
          this.$emit("uploaded", this.musicObject);

          this.uploading = false;
        } else {
          this.isShowErrorSnackbar = true;
          this.errorStr =
            "アップロードエラーが発生しました。大変申し訳ありませんが一度ログアウトしてから再試行してください。";
        }
      } catch (error) {
        console.error(error);
        this.isShowErrorSnackbar = true;
        this.errorStr =
          "アップロードエラーが発生しました。大変申し訳ありませんが一度ログアウトしてから再試行してください。";
      }
    },
    async deleteMusic() {
      if (this.musicObject.musicId) {
        await this.CloudinaryDao_DeleteFileByPublicId(this.musicObject.musicId);
        this.musicObject = {
          musicId: undefined,
        };
        this.$emit("uploaded", this.musicObject);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.upload-music-file {
  width: 100%;
}
.upload-music-file-row {
  position: relative;
}
.file-select-area {
  height: 100%;
}
.progress-bar {
  margin: 10px 0;
}
.close-icon {
  position: absolute;
  right: 12px;
  top: 12px;
}
input[type="file"] {
  position: fixed;
  clip: rect(0, 0, 0, 0);
}
</style>
