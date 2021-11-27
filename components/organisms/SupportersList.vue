<template>
  <div>
    <v-row v-if="supporters" class="supporter-list px-0 mx-0 mt-4">
      <div
        v-if="supporters.length > 0"
        class="supporters-list-contents-wrapper"
      >
        <v-list class="supporters-list-contents">
          <v-list-item
            v-for="supporter in supporters"
            :key="supporter.supporterUserId"
            class="py-2"
            @click="$emit('select-item', supporter)"
          >
            <v-card width="100%" class="supporter-card">
              <v-layout>
                <v-row align="center" justify="center">
                  <v-col class="ml-2" cols="2">
                    <v-avatar size="32px">
                      <v-img
                        :src="imgUrl(supporter.supporterImageId)"
                        alt="supporter image"
                      />
                    </v-avatar>
                  </v-col>
                  <v-col cols="4">
                    <v-row class="supporter-name body-2 pb-1">
                      <span v-text="supporter.supporterName"></span>
                    </v-row>
                  </v-col>
                  <v-col cols="5">
                    <v-row class="supporter-plan-name body-2 py-1">
                      <span v-text="supporter.planName"></span>
                    </v-row>
                  </v-col>
                </v-row>
              </v-layout>
            </v-card>
          </v-list-item>
        </v-list>
      </div>
      <div v-else>
        <v-row class="py-5" justify="center" align="center">
          <v-col class="msy-color-text-red">
            <v-row class="py-5" justify="center" align="center">
              <v-icon color="rgb(231, 64, 89)" size="72px">
                mdi-account-off
              </v-icon>
            </v-row>
            <v-row class="py-5" justify="center" align="center">
              <span v-text="'応援者がいません'"></span>
            </v-row>
          </v-col>
        </v-row>
      </div>
    </v-row>
    <v-row v-else class="supporter-list">
      <v-col justify="center" align="center" class="my-5">
        <v-progress-circular
          indeterminate
          :size="48"
          :width="5"
          :rotate="360"
          color="rgb(231, 64, 89)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { Cloudinary } from "~/constant";
export default {
  name: "SupportersList",
  props: ["supporters"],
  data() {
    return { cloudinary: Cloudinary };
  },
  methods: {
    imgUrl(supporterImageId) {
      return `https://res.cloudinary.com/${this.cloudinary.cloudName}/image/upload/${this.cloudinary.quality}/${supporterImageId}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.supporter-list {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.supporters-list-contents-wrapper {
  width: 100%;
}
.supporters-list-contents {
  width: 100%;
}
</style>
