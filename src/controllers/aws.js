import AWS from 'aws-sdk'

export const signS3 = async (req, res) => {
  try {
    const s3 = new AWS.S3()
    const fileName = req.body.fileName
    const fileType = req.body.fileType

    const s3Params = {
      Bucket: process.env.AWSBucket,
      Key: fileName,
      Expires: 60 * 10,
      ContentType: fileType,
      ACL: 'public-read'
    }

    const S3_BUCKET = process.env.AWSBucket

    const result = await s3.getSignedUrlPromise('putObject', s3Params)
    const data = { signedUrl: result, url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}` }
    return res.json({ data })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ error: true, reason: err.message })
  }
}

export const deleteObject = async (req, res) => {
  try {
    const S3_BUCKET = process.env.AWSBucket
    const { url } = req.body
    const urlParts = url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const s3 = new AWS.S3()

    const result = await s3.deleteObject({ Bucket: S3_BUCKET, Key: fileName }).promise()
    return res.json({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
