import { Schema } from 'mongoose'
import { tenantlessModel } from '../lib/multiTenant'

const businessSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  alternateName: {
    type: String,
    default: ''
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true, skipVersioning: true })

export default tenantlessModel('Business', businessSchema)
