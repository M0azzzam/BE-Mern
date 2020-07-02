import { Schema } from 'mongoose'
import { tenantlessModel } from '../lib/multiTenant'

const verificationTokenSchema = new Schema({
  token: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true, skipVersioning: true })

export default tenantlessModel('verificationToken', verificationTokenSchema)
