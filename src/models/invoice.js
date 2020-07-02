import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const invoiceSchema = new Schema({
  estimateId: {
    type: Schema.Types.ObjectId,
    ref: 'Estimate'
  },
  invoiceNumber: {
    type: Number
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  name: {
    type: String,
    required: true
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client'
  },
  propertyAddress: {
    type: Object
  },
  lineItems: [{
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Inventory'
    },
    qty: Number,
    unitCost: Number
  }],
  discount: {
    type: {
      type: String,
      enum: ['FLAT', 'PERCENTAGE']
    },
    value: Number
  },
  tax: {
    type: Schema.Types.ObjectId,
    ref: 'Tax'
  },
  clientMessage: String,
  isDelete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, skipVersioning: true })

export default tenantModel('Invoice', invoiceSchema)
