import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const clientSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['PERCENTAGE', 'CURRENCY'],
    default: 'PERCENTAGE'
  },
  default: {
    type: Boolean,
    default: false
  },
  status: {
    type: Boolean,
    default: true
  },
  isDelete: {
    type: Boolean,
    default: false
  }

}, { timestamps: true, skipVersioning: true })

export default tenantModel('Tax', clientSchema)
