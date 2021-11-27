import * as functions from "firebase-functions";
import * as cors from "cors";

const allowOrigins = functions.config().musiy.allow_origins.split(",");

export default cors({
  origin: function(origin, callback) {
    if (allowOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
});
