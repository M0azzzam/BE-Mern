import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const inventorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['Service', 'Product'],
    default: 'Service'
  },
  inventoryStock: {
    type: Schema.Types.ObjectId,
    ref: 'InventoryStock',
  },
  taxExempt: {
    type: Boolean,
    default: false
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, skipVersioning: true })

export default tenantModel('Inventory', inventorySchema)
