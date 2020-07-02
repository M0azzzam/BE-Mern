import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const deviceSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  manufacturer: {
    type: Schema.Types.ObjectId,
    ref: 'Manufacturer'
  },
  colors: [{
    type: Schema.Types.ObjectId,
    ref: 'Color'
  }],
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

export default tenantModel('Device', deviceSchema)
