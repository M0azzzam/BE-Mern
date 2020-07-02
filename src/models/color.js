import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const colorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  colorCode: {
    type: String,
    required: true
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, skipVersioning: true })

export default tenantModel('Color', colorSchema)
