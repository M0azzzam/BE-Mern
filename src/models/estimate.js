import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const estimateSchema = new Schema({
  estimateId: {
    type: Number
  },
  storeId: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  name: {
    type: String,
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
    unitCost: Number,
    description: String
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
  deposit: Number,
  issueDate: Date,
  poso: String,
  staffMessage: String,
  clientMessage: String,
  status: {
    type: String,
    enum: ['DRAFT', 'AWAITING', 'APPROVED', 'CONVERTED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  isDelete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, skipVersioning: true })

export default tenantModel('Estimate', estimateSchema)
