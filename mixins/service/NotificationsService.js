/* eslint-disable semi */
import NotificationsDao from "~/mixins/dao/NotificationsDao";
import UsersDao from "~/mixins/dao/UsersDao";
import FollowsDao from "~/mixins/dao/FollowsDao";
import { NotificationTypes } from "~/constant.js";
export default {
  mixins: [NotificationsDao, UsersDao, FollowsDao],
  methods: {
    async NotificationsService_addFollowingNotification(
      actionFromUserId,
      actionToUserId
    ) {
      const notificationId = this.$uuid.v4();
      const type = NotificationTypes.find((type) => {
        return type.type === "addFollowing";
      });
      const notificationType = type.val;

      const actionFromUser = await this.UsersDao_SelectUserByUserId(
        actionFromUserId
      );
      const isConfirmed = false;
      const message = `${actionFromUser.username}さんにフォローされました`;
      let contentUri = null;
      if (actionFromUser.isArtist) {
        contentUri = JSON.stringify({
          name: "fans-detail",
          params: { artist: actionFromUser, tab: "feeds" },
        });
      }

      const result = await this.NotificationsDao_UpsertNotification(
        notificationId,
        actionFromUserId,
        actionToUserId,
        notificationType,
        isConfirmed,
        message,
        contentUri
      );
    },
    async NotificationsService_startSupportNotification(
      actionFromUserId,
      actionToUserId
    ) {
      const notificationId = this.$uuid.v4();
      const type = NotificationTypes.find((type) => {
        return type.type === "startSupport";
      });
      const notificationType = type.val;

      const actionFromUser = await this.UsersDao_SelectUserByUserId(
        actionFromUserId
      );
      const isConfirmed = false;
      const message = `${actionFromUser.username}さんが応援を開始しました`;
      const contentUri = JSON.stringify({
        name: "artists-supporters",
      });

      const result = await this.NotificationsDao_UpsertNotification(
        notificationId,
        actionFromUserId,
        actionToUserId,
        notificationType,
        isConfirmed,
        message,
        contentUri
      );
    },
    async NotificationsService_addCommentNotification(
      actionFromUserId,
      actionToUserId,
      contentType,
      contentTitle
    ) {
      const notificationId = this.$uuid.v4();
      const type = NotificationTypes.find((type) => {
        return type.type === "addNewComment";
      });
      const notificationType = type.val;

      const actionFromUser = await this.UsersDao_SelectUserByUserId(
        actionFromUserId
      );
      const actionToUser = await this.UsersDao_SelectUserByUserId(
        actionToUserId
      );
      const isConfirmed = false;
      let contentTypeText = "";
      let contentTab = "";
      if (contentType === "movie") {
        contentTypeText = "動画";
        contentTab = "movies";
      } else if (contentType === "music") {
        contentTypeText = "音楽";
        contentTab = "musics";
      } else if (contentType === "feed") {
        contentTypeText = "フィード";
        contentTab = "feeds";
      }
      const message = `${actionFromUser.username}さんが${contentTitle}の${contentTypeText}にコメントしました`;

      const contentUri = JSON.stringify({
        name: "fans-detail",
        params: { artist: actionToUser, tab: contentTab },
      });

      const result = await this.NotificationsDao_UpsertNotification(
        notificationId,
        actionFromUserId,
        actionToUserId,
        notificationType,
        isConfirmed,
        message,
        contentUri
      );
    },
    async NotificationsService_addNewMusicNotification(
      artist,
      musicTitle,
      thumbnailId
    ) {
      const actionFromUserId = artist.userId;
      const type = NotificationTypes.find((type) => {
        return type.type === "addNewMusic";
      });
      const notificationType = type.val;

      const actionFromUser = await this.UsersDao_SelectUserByUserId(
        actionFromUserId
      );
      const isConfirmed = false;
      const message = `${actionFromUser.username}さんが楽曲「${musicTitle}」を追加しました`;

      const followUsers = await this.FollowsDao_SelectFollowsAndFansByFollowToUserId(
        actionFromUserId
      );

      const contentUri = JSON.stringify({
        name: "fans-detail",
        params: { artist, tab: "musics", notifyImg: thumbnailId },
      });

      const upsertAll = [];
      followUsers.forEach((followUser) => {
        const notificationId = this.$uuid.v4();
        const actionToUserId = followUser.followFromUserId;
        upsertAll.push(
          this.NotificationsDao_UpsertNotification(
            notificationId,
            actionFromUserId,
            actionToUserId,
            notificationType,
            isConfirmed,
            message,
            contentUri
          )
        );
      });
      const result = await Promise.all(upsertAll);
    },
    async NotificationsService_addNewMovieNotification(artist, movieTitle) {
      const actionFromUserId = artist.userId;
      const type = NotificationTypes.find((type) => {
        return type.type === "addNewMovie";
      });
      const notificationType = type.val;

      const actionFromUser = await this.UsersDao_SelectUserByUserId(
        actionFromUserId
      );
      const isConfirmed = false;
      const message = `${actionFromUser.username}さんが動画「${movieTitle}」を追加しました`;

      const followUsers = await this.FollowsDao_SelectFollowsAndFansByFollowToUserId(
        actionFromUserId
      );

      const contentUri = JSON.stringify({
        name: "fans-detail",
        params: { artist, tab: "movies" },
      });

      const upsertAll = [];
      followUsers.forEach((followUser) => {
        const notificationId = this.$uuid.v4();
        const actionToUserId = followUser.followFromUserId;
        upsertAll.push(
          this.NotificationsDao_UpsertNotification(
            notificationId,
            actionFromUserId,
            actionToUserId,
            notificationType,
            isConfirmed,
            message,
            contentUri
          )
        );
      });
      const result = await Promise.all(upsertAll);
    },
    async NotificationsService_addNewFeedNotification(
      artist,
      feedTitle,
      thumbnailId
    ) {
      const actionFromUserId = artist.userId;
      const type = NotificationTypes.find((type) => {
        return type.type === "addNewFeed";
      });
      const notificationType = type.val;

      const actionFromUser = await this.UsersDao_SelectUserByUserId(
        actionFromUserId
      );
      const isConfirmed = false;
      const message = `${actionFromUser.username}さんが「${feedTitle}」を投稿しました`;

      const followUsers = await this.FollowsDao_SelectFollowsAndFansByFollowToUserId(
        actionFromUserId
      );

      const contentUri = JSON.stringify({
        name: "fans-detail",
        params: { artist, tab: "feeds", notifyImg: thumbnailId },
      });

      const upsertAll = [];
      followUsers.forEach((followUser) => {
        const actionToUserId = followUser.followFromUserId;
        const notificationId = this.$uuid.v4();
        upsertAll.push(
          this.NotificationsDao_UpsertNotification(
            notificationId,
            actionFromUserId,
            actionToUserId,
            notificationType,
            isConfirmed,
            message,
            contentUri
          )
        );
      });
      const result = await Promise.all(upsertAll);
    },
    async NotificationsService_addNewTicketNotification(
      artist,
      datetimeStr,
      ticketTitle,
      thumbnailId
    ) {
      const actionFromUserId = artist.userId;
      const type = NotificationTypes.find((type) => {
        return type.type === "addNewTicket";
      });
      const notificationType = type.val;

      const actionFromUser = await this.UsersDao_SelectUserByUserId(
        actionFromUserId
      );
      const isConfirmed = false;
      const message = `${actionFromUser.username}さんが${datetimeStr}から開始の「${ticketTitle}」の配信予定を投稿しました`;

      const followUsers = await this.FollowsDao_SelectFollowsAndFansByFollowToUserId(
        actionFromUserId
      );

      const contentUri = JSON.stringify({
        name: "fans-detail",
        params: { artist, tab: "broadcasts", notifyImg: thumbnailId },
      });

      const upsertAll = [];
      followUsers.forEach((followUser) => {
        const actionToUserId = followUser.followFromUserId;
        const notificationId = this.$uuid.v4();
        upsertAll.push(
          this.NotificationsDao_UpsertNotification(
            notificationId,
            actionFromUserId,
            actionToUserId,
            notificationType,
            isConfirmed,
            message,
            contentUri
          )
        );
      });
      const result = await Promise.all(upsertAll);
    },
    async NotificationsService_updateTicketNotification(
      artist,
      datetimeStr,
      ticketTitle,
      thumbnailId
    ) {
      const actionFromUserId = artist.userId;
      const type = NotificationTypes.find((type) => {
        return type.type === "addNewTicket";
      });
      const notificationType = type.val;

      const actionFromUser = await this.UsersDao_SelectUserByUserId(
        actionFromUserId
      );
      const isConfirmed = false;
      const message = `${actionFromUser.username}さんが${datetimeStr}から開始の「${ticketTitle}」の配信予定を更新しました`;

      const followUsers = await this.FollowsDao_SelectFollowsAndFansByFollowToUserId(
        actionFromUserId
      );

      const contentUri = JSON.stringify({
        name: "fans-detail",
        params: { artist, tab: "broadcasts", notifyImg: thumbnailId },
      });

      const upsertAll = [];
      followUsers.forEach((followUser) => {
        const actionToUserId = followUser.followFromUserId;
        const notificationId = this.$uuid.v4();
        upsertAll.push(
          this.NotificationsDao_UpsertNotification(
            notificationId,
            actionFromUserId,
            actionToUserId,
            notificationType,
            isConfirmed,
            message,
            contentUri
          )
        );
      });
      const result = await Promise.all(upsertAll);
    },
  },
};
