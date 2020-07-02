import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const repairCategorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  imageUrl: String,
  manufacturers: [{
    manufacturer: {
      type: Schema.Types.ObjectId,
      ref: 'Manufacturer',
      required: true
    },
    devices: [{
      type: Schema.Types.ObjectId,
      ref: 'Device'
    }]
  }],
  triggers: {
    onPOS: {
      type: Boolean,
      default: true
    },
    onWidget: {
      type: Boolean,
      default: true
    }
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, skipVersioning: true })

export default tenantModel('RepairCategory', repairCategorySchema)
