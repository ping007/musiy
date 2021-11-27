import * as functions from "firebase-functions"
import * as cloudinary from "cloudinary"

const deleteFileByPublicId = function(publicId: string) {
  const params = [publicId]
  const cl: any = cloudinary
  cl.config({
    cloud_name: functions.config().cloudinary.cloud_name, // https-lifema-co-jp
    api_key: functions.config().cloudinary.api_key, // 668622266819913
    api_secret: functions.config().cloudinary.api_secret, // X_fcxMzV20cYQW4OVnon5EefMRQ
  })
  const options = {}
  return cl.v2.api.delete_resources(
    params,
    options,
    (error: any, result: any) => {
      console.log(result)
      console.log(error)
    }
  )
}

export const delete_file_by_public_id = functions
  .region("asia-northeast1")
  .https.onCall((data, context) => {
    return deleteFileByPublicId(data.publicId).then((result: any) => {
      return result
    })
  })
