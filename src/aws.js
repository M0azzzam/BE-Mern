import AWS from 'aws-sdk'

AWS.config.update({
  region: process.env.AWSRegion,
  credentials: {
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey
  }
})
