<template>
  <v-container class="ma-2">
    <v-row v-for="(schedule,idx) in schedules" :key="schedule.scheduleId" class="my-2">
      <v-card v-if="opened? true: idx < 2" class="pa-2">
        <v-row>
          <v-col cols="5" class="ml-5">
            <v-row align="end">
              <div class="display-1" v-text="schedule.date">
              </div>
              <div class="body-2 mb-1 mx-3" v-text="schedule.dayOfTheWeek">
              </div>
            </v-row>
            <v-row class="body-1 my-2" v-text="schedule.title" />
          </v-col>
          <v-col class="mr-5">
            <v-row class="caption" v-text="schedule.description" />
          </v-col>
        </v-row>
      </v-card>
    </v-row>
    <v-row v-show="!opened" align="center" justify="center">
      <v-btn outlined rounded small color="rgba(0,0,0,0.75)" @click="$emit('list-open')">
        <v-icon left>
          mdi-arrow-down
        </v-icon>全て見る
      </v-btn>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    opened: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      schedules: [
        {
          scheduleId: 0,
          date: "7/2",
          dayOfTheWeek: "Thu",
          title: "ライブタイトル",
          description:
            "ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明"
        },
        {
          scheduleId: 1,
          date: "7/5",
          dayOfTheWeek: "Sun",
          title: "ライブタイトル2",
          description:
            "ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明"
        },
        {
          scheduleId: 2,
          date: "7/12",
          dayOfTheWeek: "Sun",
          title: "ライブタイトル3",
          description:
            "ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明"
        },
        {
          scheduleId: 3,
          date: "7/24",
          dayOfTheWeek: "Fri",
          title: "ライブタイトル4",
          description:
            "ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明"
        },
        {
          scheduleId: 4,
          date: "8/11",
          dayOfTheWeek: "Tue",
          title: "ライブタイトル5",
          description:
            "ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明ライブ説明"
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
