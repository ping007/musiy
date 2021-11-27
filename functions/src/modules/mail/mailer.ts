import * as mail from "nodemailer";
import * as functions from "firebase-functions";

const gmailEmail = functions.config().gmail.email;
const mailTransport = mail.createTransport({
  service: "Gmail",
  auth: {
    user: gmailEmail,
    pass: functions.config().gmail.password,
  }
});

export const sendMail = async function (
  sendTo: string, title: string, content: string, html: string = "",
) {
  const email = {
    from: gmailEmail,
    to: sendTo,
    subject: title,
    text: content,
    html: "",
  };
  if (html) {
    email.text = "";
    email.html = html;
  }
  try {
    await mailTransport.sendMail(email);
  } catch (e) {
    console.error(`send failed. ${e}`);
    throw new functions.https.HttpsError("internal", "send failed");
  }
};
