import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'


const manufacturerSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  imageUrl: String,
  triggers: {
    onPOS: Boolean,
    onWidget: Boolean
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, skipVersioning: true })

export default tenantModel('Manufacturer', manufacturerSchema)
