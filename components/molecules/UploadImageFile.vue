<template>
  <div class="upload-image-file">
    <v-container class="py-4">
      <v-row class="upload-image-file-row" align="center" justify="center">
        <v-dialog
          v-if="isAvatar"
          transition="dialog-bottom-transition"
          max-width="600"
        >
          <template v-slot:activator="{ on, attrs }">
            <input
              v-if="viewFile"
              ref="input"
              type="file"
              name="image"
              accept="image/*"
              @change="setImage"
            />
            <div class="cropped-image">
              <v-avatar
                v-if="!uploading"
                :size="imageSize"
                v-bind="attrs"
                v-on="on"
                @click.prevent="showFileChooser"
              >
                <img
                  v-if="uploadEnd && imgUrl"
                  :src="imgUrl"
                  alt="Cropped Image"
                />
                <div
                  v-else
                  class="crop-placeholder v-icon mdi mdi-camera"
                ></div>
              </v-avatar>
            </div>
          </template>
          <template v-slot:default="dialog">
            <v-card>
              <v-toolbar color="primary" dark>写真を切り取る</v-toolbar>
              <div class="content text-center">
                <section class="cropper-area">
                  <div class="img-cropper">
                    <vue-cropper
                      ref="cropper"
                      :aspect-ratio="1"
                      :src="imgSrc"
                      preview=".preview"
                    />
                  </div>
                </section>
                <section class="preview-area">
                  <v-avatar :size="imageSize">
                    <div class="preview"></div>
                  </v-avatar>
                </section>
              </div>
              <v-card-actions class="justify-end">
                <v-btn :disabled="saveDisabled" @click.prevent="rotate(90)">
                  回転
                </v-btn>
                <v-btn @click="closeDialog(dialog)">閉じる</v-btn>
                <v-btn
                  color="primary"
                  :disabled="saveDisabled"
                  @click="
                    cropImage();
                    closeDialog(dialog);
                  "
                >
                  保存
                </v-btn>
              </v-card-actions>
            </v-card>
          </template>
        </v-dialog>

        <v-card
          v-else-if="!isAvatar && !uploadEnd && !uploading"
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
            <span v-text="'画像ファイルを追加'"></span>
          </v-row>
        </v-card>
        <v-img
          v-if="uploadEnd && !isAvatar"
          :src="imgUrl"
          lazy-src="/images/no_image.png"
        >
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="grey lighten-5" />
            </v-row>
          </template>
        </v-img>

        <v-icon
          v-if="uploadEnd"
          class="close-icon"
          :class="isAvatar ? 'avatar' : ''"
          large
          color="red"
          @click="deleteImage()"
        >
          mdi-close-circle
        </v-icon>
      </v-row>
      <v-row align="center" justify="center">
        <input
          id="imageFile"
          ref="uploadInput"
          type="file"
          name="file"
          accept="image/*"
          :multiple="false"
          :tabindex="-1"
          @change="detectFiles($event)"
        />
        <v-progress-circular
          v-if="uploading"
          :size="96"
          :width="15"
          :rotate="360"
          :value="progressUpload"
          color="rgb(231, 64, 89)"
        >
          {{ progressUpload }}%
        </v-progress-circular>
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
import VueCropper from "vue-cropperjs";
import axios from "~/plugins/axios";
import { Cloudinary } from "~/constant";
import CloudinaryDao from "~/mixins/dao/CloudinaryDao";
import "cropperjs/dist/cropper.css";

export default {
  name: "UploadImageFile",
  components: {
    VueCropper,
  },
  mixins: [CloudinaryDao],
  props: {
    size: {
      type: Number,
      default: 0,
    },
    imageId: {
      type: String,
      default: "",
    },
    isAvatar: Boolean,
  },
  data() {
    return {
      progressUpload: 0,
      imageSize: 96,
      fileName: "",
      uploadTask: "",
      uploading: false,
      isShowErrorSnackbar: false,
      errorStr: "",
      imageObject: {
        imageId: this.imageId,
      },
      cloudinary: Cloudinary,
      viewFile: true,
      imgSrc:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=",
    };
  },
  computed: {
    clUrl() {
      return `https://api.cloudinary.com/v1_1/${this.cloudinary.cloudName}/image/upload`;
    },
    imgUrl() {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${this.imageObject.imageId}`;
    },
    uploadEnd() {
      return (
        this.imageObject.imageId !== null &&
        this.imageObject.imageId !== undefined &&
        this.imageObject.imageId !== ""
      );
    },
    saveDisabled() {
      return (
        this.imgSrc === null ||
        this.imgSrc === undefined ||
        this.imgSrc ===
          "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII="
      );
    },
  },
  watch: {
    uploadTask() {
      this.uploadTask.on(
        "state_changed",
        (sp) => {
          this.progressUpload = Math.floor(
            (sp.bytesTransferred / sp.totalBytes) * 100
          );
        },
        null,
        () => {
          this.uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            this.downloadURL = downloadURL;
            this.$emit("downloadURL", downloadURL);
          });
          this.uploadTask.snapshot.ref.getMetadata().then((metadata) => {
            this.fileName = metadata.name;
            this.$emit("fileName", this.fileName);
          });
        }
      );
    },
  },
  created() {
    if (this.size) {
      this.imageSize = this.size;
    } else {
      this.imageSize = 96;
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
      if (Object.prototype.toString.call(file) === "[object File]") {
        const fileName = file.name.split(".")[0];
        const fileExtension = file.name.split(".")[1];
        this.fileName = fileName + "." + fileExtension;
      }
      this.progressUpload = 0;
      this.uploading = true;
      console.log(this.cloudinary.uploadPreset);
      console.log(this.clUrl);
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
        formData.append("folder", user.userId + "/images");
        formData.append("tags", "gs-vue,gs-vue-uploaded");
        // Execute api
        const res = await axios.put(this.clUrl, formData, config);
        if (res.data && res.data.public_id && res.data.secure_url) {
          console.log("res.data:", res.data);
          this.imageObject.imageId = res.data.public_id;
          this.$emit("uploaded", this.imageObject);
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
      } finally {
        this.uploading = false;
      }
    },
    async deleteImage() {
      if (this.imageObject.imageId) {
        await this.CloudinaryDao_DeleteFileByPublicId(this.imageObject.imageId);
        this.imageObject = {
          imageId: "",
        };
        this.$emit("uploaded", this.imageObject);
      }
    },
    closeDialog(dlg) {
      dlg.value = false;
      this.imgSrc =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQI12NgYAAAAAMAASDVlMcAAAAASUVORK5CYII=";
      this.$refs.cropper.replace(this.imgSrc);
      this.resetInputFile();
    },
    resetInputFile() {
      this.viewFile = false;
      this.$nextTick(function () {
        this.viewFile = true;
      });
    },
    cropImage() {
      this.upload(this.$refs.cropper.getCroppedCanvas().toDataURL());
    },
    rotate(deg) {
      this.$refs.cropper.rotate(deg);
    },
    setImage(e) {
      const file = e.target.files[0];

      if (!file.type.includes("image/")) {
        alert("Please select an image file");
        return;
      }

      if (typeof FileReader === "function") {
        const reader = new FileReader();

        reader.onload = (event) => {
          this.imgSrc = event.target.result;
          // rebuild cropperjs with the updated source
          this.$refs.cropper.replace(event.target.result);
        };

        reader.readAsDataURL(file);
      } else {
        alert("Sorry, FileReader API not supported");
      }
    },
    showFileChooser() {
      this.$refs.input.click();
    },
  },
};
</script>

<style lang="scss" scoped>
.upload-image-file {
  width: 100%;
}
.upload-image-file-row {
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
.close-icon.avatar {
  position: absolute;
  right: 33vw;
  top: -5px;
}
input[type="file"] {
  position: fixed;
  clip: rect(0, 0, 0, 0);
}
.avatar-image {
  object-fit: cover;
}

input[type="file"] {
  display: none;
}

.cropper-area {
  height: 300px;
}

.actions {
  margin-top: 1rem;
}

.actions a {
  display: inline-block;
  padding: 5px 10px;
  background: #0062cc;
  color: #fff;
  text-decoration: none;
  border-radius: 3px;
}

.crop-placeholder {
  width: 100%;
  height: 200px;
  background: #ccc;
}

.cropped-image img {
  max-width: 100%;
}

.preview-area {
  width: 307px;
}
.preview-area p {
  font-size: 1.25rem;
  margin: 0;
  margin-bottom: 1rem;
}
.preview-area p:last-of-type {
  margin-top: 1rem;
}
.preview {
  width: 100%;
  height: calc(372px);
  overflow: hidden;
}
</style>
