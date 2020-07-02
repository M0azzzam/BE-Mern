import AWS from 'aws-sdk'
import uuid4 from 'uuid4'
import { getCurrentTenantId } from '../lib/storage'


const generateFileName = (fileName, fileType, path) => {
  const tenantId = getCurrentTenantId()
  const uuid = uuid4()
  return `${path}/${tenantId}_${uuid}_${fileName}.${fileType}`
}

export const getSignedUrlForObject = async (fileString, path) => {
  try {
    const fileParts = fileString.split('.')
    const fileType = fileParts.splice(fileParts.length - 1, 1)[0]
    const fileName = fileParts.join('.')

    const newFileName = generateFileName(fileName, fileType, path)

    const s3 = new AWS.S3()
    const ACL = 'public-read'
    const S3_BUCKET = process.env.AWSBucket

    const s3Params = {
      Bucket: S3_BUCKET,
      Key: newFileName,
      Expires: 60 * 10,
      ContentType: fileType,
      ACL
    }

    const result = await s3.getSignedUrlPromise('putObject', s3Params)
    const data = { signedUrl: result, header: { ContentType: fileType, "x-amz-acl": ACL }, url: `https://${S3_BUCKET}.s3.amazonaws.com/${newFileName}` }
    return data
  } catch (err) {
    console.log(err)
    return { error: true, reason: err.message }
  }
}


export const deleteObject = async (url) => {
  try {
    const S3_BUCKET = process.env.AWSBucket
    const urlObj = new URL(url)
    const fileName = urlObj.pathname.slice(1)
    const s3 = new AWS.S3()

    const result = await s3.deleteObject({ Bucket: S3_BUCKET, Key: fileName }).promise()
    return result
  } catch (err) {
    console.log(err)
    return { error: true, reason: err.message }
  }
}
