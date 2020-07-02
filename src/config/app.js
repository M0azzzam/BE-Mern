// app configurations

const AWSAccessKeyId = 'AKIAJARUZJZO5N4V7XAA'
const AWSSecretKey = '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'
const AWSRegion = 'us-east-1'
const AWSBucket = 'repairdesk-replica-dev'


process.env.AWSAccessKeyId = AWSAccessKeyId
process.env.AWSSecretKey = AWSSecretKey
process.env.AWSRegion = AWSRegion
process.env.AWSBucket = AWSBucket

export default {
  authKey: process.env.JWT_KEY || 'secret',
  sendGridApiKey: process.env.SEND_GRID_API_KEY || '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',
  AWSAccessKeyId,
  AWSSecretKey,
  AWSBucket,
  AWSRegion
}

