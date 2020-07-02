import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const physicalLocationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, skipVersioning: true })

export default tenantModel('PhysicalLocation', physicalLocationSchema)
