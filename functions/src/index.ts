import * as admin from "firebase-admin";
import * as Handlebars from "handlebars";

const serviceAccount = require("../musiy-dev-firebase-adminsdk-yrm8b-cff970a861.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://musiy-dev.firebaseio.com",
});
const agoras = {
  get_agora_token: "./modules/agora/token",
};

const allowed_contents = {
  select_allowed_content_by_content_id: "./modules/allowed_contents",
  upsert_allowed_content: "./modules/allowed_contents",
  delete_allowed_content: "./modules/allowed_contents",
};

const delete_file = {
  delete_file_by_public_id: "./modules/cloudinary/delete_file",
};

const evaluations = {
  select_evaluations_by_content_id: "./modules/evaluations",
  select_evaluations_comments_by_content_id: "./modules/evaluations",
  select_evaluations_is_liked_by_content_id: "./modules/evaluations",
  select_evaluations_is_liked_by_user_id: "./modules/evaluations",
  select_evaluations_is_liked_by_content_id_and_user_id:
    "./modules/evaluations",
  select_evaluations_by_user_id: "./modules/evaluations",
  upsert_evaluation: "./modules/evaluations",
  update_evaluations_is_show_comment_false: "./modules/evaluations",
  select_evaluations_is_liked_by_like_content_id: "./modules/evaluations",
};

const feeds = {
  select_feed_by_feed_id: "./modules/feeds",
  select_feeds_by_user_id: "./modules/feeds",
  upsert_feed: "./modules/feeds",
  move_to_feeds_hist: "./modules/feeds",
};

const follows = {
  select_follows_by_follow_from_user_id: "./modules/follows",
  select_follows_by_follow_to_user_id: "./modules/follows",
  upsert_follow: "./modules/follows",
  select_follows_and_fans_by_follow_to_user_id: "./modules/follows",
};

const imagefluxes = {
  imageflux_create_channel: "./modules/imageflux/api",
  imageflux_delete_channel: "./modules/imageflux/api",
  imageflux_hls_member_authentication: "./modules/imageflux/api",
  imageflux_event_webhook: "./modules/imageflux/api",
};

const movies = {
  select_play_later_movies_by_user_id: "./modules/movies",
  select_top_100_play_movies: "./modules/movies",
  select_top_100_new_movies: "./modules/movies",
  select_movie_by_movie_id: "./modules/movies",
  select_movie_by_movie_ids: "./modules/movies",
  select_movies_by_user_id: "./modules/movies",
  select_purchased_movies_by_user_id: "./modules/movies",
  upsert_movie: "./modules/movies",
  update_movie_play_counts: "./modules/movies",
};

const musics = {
  select_play_later_musics_by_user_id: "./modules/musics",
  select_top_100_play_musics: "./modules/musics",
  select_top_100_new_musics: "./modules/musics",
  select_music_by_music_id: "./modules/musics",
  select_music_by_music_ids: "./modules/musics",
  select_musics_by_user_id: "./modules/musics",
  select_purchased_musics_by_user_id: "./modules/musics",
  upsert_music: "./modules/musics",
  update_music_play_counts: "./modules/musics",
  select_musics_by_artist_user_id: "./modules/musics",
};

const notifications = {
  select_notifications_by_user_id: "./modules/notifications",
  upsert_notification: "./modules/notifications",
};

const music_details = {
  select_music_details_by_parent_content_id: "./modules/music_details",
  upsert_music_detail: "./modules/music_details",
  delete_music_detail: "./modules/music_details",
};

const plans = {
  select_plans_by_user_id: "./modules/plans",
  select_plan_by_supporter_user_id: "./modules/plans",
  select_plan_by_plan_id: "./modules/plans",
  select_plan_by_plan_ids: "./modules/plans",
  upsert_plan: "./modules/plans",
};

const play_later = {
  exist_play_later: "./modules/play_later",
  upsert_play_later: "./modules/play_later",
  delete_play_later: "./modules/play_later",
};

const points = {
  select_points_by_user_id: "./modules/points",
};

const purchased_contents = {
  select_purchased_contents_by_user_id: "./modules/purchased_contents",
  select_purchased_contents_amount_by_artist_user_id:
    "./modules/purchased_contents",
  select_purchased_media_by_specified_year: "./modules/purchased_contents",
  upsert_purchased_content: "./modules/purchased_contents",
  is_purchased_content: "./modules/purchased_contents",
};

const scheduled_payments = {
  select_scheduled_payments: "./modules/scheduled_payments",
  monthly_scheduled_payment: "./modules/scheduled_payments",
  update_scheduled_payments_is_canceled: "./modules/scheduled_payments",
};

const supporters = {
  select_supporters_by_artist_user_id: "./modules/supporters",
  select_supporters_by_supporter_user_id: "./modules/supporters",
  upsert_supporter: "./modules/supporters",
  send_mail_when_content_upload_by_plan_id: "./modules/supporters",
};

const transfer_amounts = {
  select_transfer_amounts: "./modules/transfer_amounts",
  select_transfer_amount_by_user_id: "./modules/transfer_amounts",
  select_total_amount_pendding_withdrawal_by_user_id:
    "./modules/transfer_amounts",
  insert_transfer_amount: "./modules/transfer_amounts",
  update_transfer_is_transferred: "./modules/transfer_amounts",
  is_master_account: "./modules/transfer_amounts",
};

const users = {
  select_new_artist_users: "./modules/users",
  select_artist_users_by_genre: "./modules/users",
  select_user_by_user_id: "./modules/users",
  select_all_artists: "./modules/users",
  select_following_artist_users: "./modules/users",
  select_supporting_artist_users: "./modules/users",
  upsert_user: "./modules/users",
  update_user_latest_login_datetime: "./modules/users",
  update_user_is_artist: "./modules/users",
  select_artist_by_user_id: "./modules/users",
};

const broadcasts = {
  insert_broadcast: "./modules/broadcasts",
  select_broadcasts_by_user_id: "./modules/broadcasts",
  select_top_100_new_broadcasts: "./modules/broadcasts",
  select_one_broadcast: "./modules/broadcasts",
  cancel_one_broadcast: "./modules/broadcasts",
  update_broadcast: "./modules/broadcasts",
  select_full_statement_of_broadcasts: "./modules/broadcasts",
  select_one_full_statement_of_broadcast: "./modules/broadcasts",
  select_tickets_by_user_id: "./modules/broadcasts",
  purchase_broadcast_ticket: "./modules/broadcasts",
  cancel_broadcast_ticket: "./modules/broadcasts",
  select_broadcast_by_broadcasts_ids: "./modules/broadcasts",
  finish_broadcast: "./modules/broadcasts",
  scheduled_1_hour_update_is_finish_broadcast: "./modules/broadcasts",
};

const broadcast_signals = {
  broadcast_signal_pause: "./modules/broadcast_signals",
};

const broadcast_channel_members = {
  broadcast_channel_member_remove: "./modules/broadcast_channel_members",
};

const stripe = {
  save_card_info: "./modules/stripe/stripe",
  load_card_info: "./modules/stripe/stripe",
  save_account_info: "./modules/stripe/stripe",
  load_account_info: "./modules/stripe/stripe",
  exec_purchase_at_once: "./modules/stripe/stripe",
};

const chat = {
  is_valid_message: "./modules/chat",
};

const content_views = {
  select_views_by_content_id: "./modules/content_views",
  upsert_views: "./modules/content_views",
};

const usage_report = {
  usage_report: "./modules/usage_reports",
};

const ssr = {
  ogptag: "./modules/ssr/ogptag",
};

// const search_music = { search_music: "./modules/elasticsearch/search_musics" }

const funcs = {};
Object.assign(
  funcs,
  agoras,
  allowed_contents,
  delete_file,
  evaluations,
  feeds,
  follows,
  imagefluxes,
  movies,
  music_details,
  musics,
  notifications,
  plans,
  play_later,
  points,
  purchased_contents,
  scheduled_payments,
  supporters,
  transfer_amounts,
  users,
  broadcasts,
  broadcast_signals,
  broadcast_channel_members,
  stripe,
  chat,
  content_views,
  usage_report,
  ssr
);

const loadFunctions = (funcsObj: any) => {
  console.log("loadFunctions " + process.env.FUNCTION_NAME);
  for (const name in funcsObj) {
    if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === name) {
      exports[name] = require(funcsObj[name])[name];
    }
  }
};

loadFunctions(funcs);
console.log("exports:", exports);

Handlebars.registerHelper("escapeHtmlWithoutBr", function(text) {
  return text
    .replace(/(\r\n|\n|\r)/gm, "<br>")
    .split("<br>")
    .map(function(item) {
      return item
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    })
    .join("<br>");
});
