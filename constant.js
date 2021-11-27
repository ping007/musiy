/* eslint-disable semi */
export const ValidateRules = {
  required: (value) => {
    return !!value || "入力必須項目です。";
  },
  email: (value) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || "メールアドレスの形式が不正です。";
  },
  password: (value) => {
    const pattern = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d)[a-zA-Z\d]{8,100}$/;
    return (
      pattern.test(value) ||
      "パスワードは大文字小文字をそれぞれ含む英数字で８文字以上としてください。"
    );
  },
  zenkana: (value) => {
    // eslint-disable-next-line no-irregular-whitespace
    const pattern = /^[ァ-ヶー　]+$/;
    return pattern.test(value) || "全角カナ文字で入力してください";
  },
  number: (value) => {
    const pattern = /^[0-9]+$/;
    return pattern.test(value) || "半角数字で入力してください";
  },
  minLengthPassword: (value) => {
    return (value || "").length >= 6 || "6文字以上入力してください";
  },
  minValue: (value, min) => {
    return value >= min || `${min} 以上で入力して下さい`;
  },
  maxValue: (value, max) => {
    return value <= max || `${max} 以下で入力して下さい`;
  },
  maxLength: (value, max) => {
    return (value || "").length <= max || `${max} 文字以下で入力して下さい`;
  },
  confirmationCode: (value) => {
    const pattern = /^[0-9]{6}$/;
    return pattern.test(value) || "確認コードの形式が不正です";
  },
  onlyPositiveNumber: (value) => {
    let res = false;
    if (value) {
      res = value > 0;
    } else {
      res = true;
    }
    return res || "0以下の数は入力できません";
  },
  onlyZeroAndPositiveNumber: (value) => {
    let res = false;
    if (value) {
      res = value >= 0;
    } else {
      res = true;
    }
    return res || "0未満の数は入力できません";
  },
  validateSupportPoint: (value) => {
    let res = false;
    if (value === 0) {
      res = true;
    } else if (value >= 100) {
      res = true;
    }
    return res || "100 以上で入力してください";
  },
};
export const ContentAllowType = {
  All: 1,
  FollowersOrSupporters: 2,
  Supporters: 3,
};
export const CopyrightItems = [
  { label: "JASRAC", value: "jasrac" },
  { label: "NEXSTONE", value: "nextone" },
  { label: "著作権管理なし（オリジナル曲など）", value: "original" },
];
export const NoLoginPagePaths = [
  "/law",
  "/login",
  "/logout",
  "/forget-password",
  "/forget-password-confirmation",
  "/register",
  "/register-confirmation",
  "/social-register",
  "/terms-of-service",
  "/privacy-policy",
  "/terms-of-service",
];
export const Agora = {
  appId: "410dd4f64996484887af02d4204878b4",
};
const SKY_WAY_DEBUG_LEVEL = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  FULL: 3,
};
export const SkyWay = {
  key:
    process.env.VUE_APP_SKYWAY_APP_KEY ||
    "e0fde27c-ba25-41b8-8965-145e5a5cb726",
  debug: SKY_WAY_DEBUG_LEVEL.WARN,
};
export const Cloudinary = {
  quality: "f_auto,q_auto:good",
  uploadPreset:
    process.env.VUE_APP_CLOUDINARY_UPLOAD_PRESET || "musiy_video_upload",
  apiKey: process.env.VUE_APP_CLOUDINARY_API_KEY || "551483624749584",
  cloudName: process.env.VUE_APP_CLOUDINARY_CLOUD_NAME || "musiy",
};
export const NotificationTypes = [
  { type: "addFollowing", label: "フォロー追加", val: 0 },
  { type: "addNewMusic", label: "楽曲追加", val: 1 },
  { type: "addNewMovie", label: "動画追加", val: 2 },
  { type: "addNewFeed", label: "投稿追加", val: 3 },
  { type: "startSupport", label: "応援開始", val: 4 },
  { type: "modStream", label: "配信更新", val: 5 },
  { type: "addNewTicket", label: "チケット追加", val: 6 },
  { type: "addNewComment", label: "コメント追加", val: 7 },
];

export const CacheKeys = {
  newArtistUsersCacheKey: "musiyNewArtistUsers",
  top100PlayMoviesCacheKey: "musiyTop100PlayMovies",
  top100NewMoviesCacheKey: "musiyTop100NewMovies",
  top100NewBroadcastsCacheKey: "musiyTop100NewBroadcasts",
  top100PlayMusicsCacheKey: "musiyTop100PlayMusics",
  top100NewMusicsCacheKey: "musiyTop100NewMusics",
  evaluationsIsLikedByUserIdCacheKey: "musiyEvaluationsIsLikedByUserId",
  sendMailCheckCreateTicketCacheKeyPrefix: "sendMailCheckCreateTicket",
  sendMailCheckEditContentFileCacheKeyPrefix: "sendMailCheckCreateTicket",
  sendMailCheckUploadFileCacheKeyPrefix: "sendMailCheckCreateTicket",
  artistDetailFeedsCacheKeyPrefix: "musiyArtistDetailFeeds",
  artistDetailMoviesCacheKeyPrefix: "musiyArtistDetailMovies",
  artistDetailMusicsCacheKeyPrefix: "musiyArtistDetailMusics",
  artistDetailBroadcastsCacheKeyPrefix: "musiyArtistDetailBroadcasts",
  artistProfileFeedsCacheKeyPrefix: "musiyArtistProfileFeeds",
  artistProfileMoviesCacheKeyPrefix: "musiyArtistProfileMovies",
  artistProfileMusicsCacheKeyPrefix: "musiyArtistProfileMusics",
  artistProfileBroadcastsCacheKeyPrefix: "musiyArtistProfileBroadcasts",
};

export const MusicGenreItems = [
  // { label: "ロック", val: "rock" },
  // { label: "ポップス", val: "pops" },
  // { label: "ジャズ", val: "jazz" },
  // { label: "フュージョン", val: "fusion" },
  // { label: "ソウル", val: "soul" },
  // { label: "R&B", val: "randb" },
  // { label: "ワールド", val: "world" },
  // { label: "クラシック", val: "classic" },
  // { label: "サウンドトラック", val: "soundtrack" },
  // { label: "伝統音楽・芸能", val: "traditional" },
  // { label: "演歌・歌謡曲", val: "enka" },
  // { label: "ヒップホップ", val: "hiphop" },
  // { label: "ブルース", val: "blues" },
  // { label: "ラテン", val: "latin" },
  // { label: "カントリー", val: "country" },
  // { label: "レゲエ", val: "reggae" },
  // { label: "ダンス", val: "dance" },
  // { label: "キッズ", val: "kids" },
  // { label: "交響曲", val: "symphony" },
  // { label: "協奏曲", val: "concerto" },
  { label: "器楽", val: "instrumental" },
  { label: "声楽", val: "vocal" },
  { label: "日本音楽", val: "japanese" },
  { label: "その他", val: "other" },
];
