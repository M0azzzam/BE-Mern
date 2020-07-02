import AWS from 'aws-sdk'
import multer from 'multer'
import multerS3 from 'multer-s3'
import { generateFileName } from '../utils/helpers'

AWS.config.update({
  region: process.env.AWSRegion,
  credentials: {
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey
  }
})

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: process.env.AWSBucket,
    acl: 'public-read',
    // metadata: function (req, file, cb) {
    //   cb(null, { fieldName: 'fieldname' });
    // },
    key: function (req, file, cb) {
      const { section } = req.query
      console.log('========= req ', req.query)
      const fileName = generateFileName(file.originalname, section)
      cb(null, fileName)
    }
  }),
})

export default upload;
