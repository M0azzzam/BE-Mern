import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const inventoryStockSchema = new Schema({
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  unitCost: {
    type: Number,
    default: 0
  },
  quantity: {
    type: Number,
    default: 0
  },
  reOrderLevel: {
    type: Number,
    default: 0
  }
}, { timestamps: true, skipVersioning: true })

export default tenantModel('InventoryStock', inventoryStockSchema)
