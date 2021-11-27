import * as functions from "firebase-functions"
import { RtcTokenBuilder } from "agora-access-token"

const getAgoraToken = function(data: {appId: string, channelName: string, userName: string, role: number}) {
  const agoraConfig = functions.config().agora
  const appCertificate = agoraConfig.app_certificate
  const expirationTimeInSeconds = Number(agoraConfig.expiration_time_in_seconds)
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
  return RtcTokenBuilder.buildTokenWithAccount(data.appId, appCertificate, data.channelName, data.userName, data.role, privilegeExpiredTs)
}

export const get_agora_token = functions
  .region("asia-northeast1")
  .https
  .onCall((data, context) => {
    return getAgoraToken(data)
  })