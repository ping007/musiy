<template>
  <div class="upload-movie-file">
    <v-container class="py-4">
      <v-row class="upload-movie-file-row" align="center" justify="center">
        <v-card
          v-if="!uploadEnd && !uploading"
          class="ma-2"
          :width="'100vw'"
          height="240px"
          dark
          color="grey"
        >
          <v-row
            v-if="!uploadEnd && !uploading"
            class="file-select-area"
            align="center"
            justify="center"
            @click="selectFile"
          >
            <v-icon medium dark>mdi-plus</v-icon>
            <span v-text="'動画ファイルを追加'"></span>
          </v-row>
        </v-card>

        <video v-if="uploadEnd" :width="'100%'" controls :poster="posterUrl">
          <source :src="mp4Url" type="video/mp4" />
        </video>

        <v-icon
          v-if="uploadEnd"
          class="close-icon"
          large
          color="red"
          @click="deleteMovie()"
        >mdi-close-circle</v-icon>
      </v-row>
      <v-row v-show="!uploadEnd && !uploading" align="center" justify="center">
        <span>↓大容量ファイル（500MBまで）はこちら</span>
      </v-row>
      <v-row v-show="!uploadEnd && !uploading" align="center" justify="center">
        <button id="upload_widget" class="cloudinary-button">
          大容量ファイルアップロード
        </button>
      </v-row>
      <v-row align="center" justify="center">
        <input
          id="movieFile"
          ref="uploadInput"
          type="file"
          name="file"
          accept="video/*;capture=camcorder"
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
  name: "UploadMovieFile",
  mixins: [CloudinaryDao],
  model: {
    prop: "targetMovieURL",
    event: "downloadURL",
  },
  props: {
    targetMovieURL: {
      type: String,
      default: "",
    },
    movieFileName: {
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
      movieObject: {
        movieId: undefined,
      },
      cloudinary: Cloudinary,
    };
  },
  computed: {
    clUrl() {
      return `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/video/upload`;
    },
    posterUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/video/upload/${this.movieObject.movieId}.jpg`;
    },
    mp4Url() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/video/upload/${this.movieObject.movieId}.mp4`;
    },
    uploadEnd() {
      return (
        this.movieObject.movieId !== null &&
        this.movieObject.movieId !== undefined &&
        this.movieObject.movieId !== ""
      );
    },
  },
  created() {
    if (this.storagePath) {
      this.fbStoragePath = this.storagePath;
    }
    if (this.movieFileName && this.movieFileName !== "") {
      this.fileName = this.movieFileName;
      this.movieObject.movieId = this.movieFileName.split(".")[0];
    }
  },
  mounted() {
    const widget = this.prepareLargeFileUploader();

    document.getElementById("upload_widget").addEventListener(
      "click",
      function () {
        widget.open();
      },
      false
    );
  },
  methods: {
    prepareLargeFileUploader() {
      const user = this.$store.state.user.user;
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: this.cloudinary.cloudName,
          uploadPreset: this.cloudinary.uploadPreset,
          folder: user.userId + "/movies",
        },
        (error, result) => {
          if (!error && result && result.event === "success") {
            console.log("Done! Here is the image info: ", result.info);
            this.movieObject.movieId = result.info.public_id;
            this.$emit("uploaded", this.movieObject);
          } else if (error) {
            this.isShowErrorSnackbar = true;
            this.errorStr =
              "アップロードエラーが発生しました。大変申し訳ありませんが一度ログアウトしてから再試行してください。";
          }
        }
      );
      window.cloudinary.applyUploadWidget(
        document.getElementById("upload_widget_opener"),
        {
          api_key: this.cloudinary.apiKey,
          cloudName: this.cloudinary.cloudName,
        }
      );
      return widget;
    },
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
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        };
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", this.cloudinary.uploadPreset);
        formData.append("folder", user.userId + "/movies");
        formData.append("tags", "gs-vue,gs-vue-uploaded");
        // Execute api
        const res = await axios.put(this.clUrl, formData, config);
        if (res.data && res.data.public_id && res.data.secure_url) {
          console.log("res.data:", res.data);
          this.movieObject.movieId = res.data.public_id;
          this.$emit("uploaded", this.movieObject);

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
    async deleteMovie() {
      if (this.movieObject.movieId) {
        const isConfirm = confirm(
          "アップロードされた動画ファイルがサーバー上から完全に削除されます。よろしいですか？"
        );
        if (isConfirm) {
          await this.CloudinaryDao_DeleteFileByPublicId(
            this.movieObject.movieId
          );
          this.movieObject = {
            movieId: undefined,
          };
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.upload-movie-file {
  width: 100%;
}
.upload-movie-file-row {
  position: relative;
}
.file-select-area {
  height: 100%;
}
.progress-bar {
  margin: 10px 0;
}
.close-icon {
  position: absolute !important;
  top: 12px;
  right: 12px;
}
input[type="file"] {
  position: fixed;
  clip: rect(0, 0, 0, 0);
}
</style>
