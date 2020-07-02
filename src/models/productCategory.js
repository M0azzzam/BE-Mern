import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const productCategorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'ProductCategory'
  },
  path: {
    type: [Schema.Types.ObjectId],
    ref: 'ProductCategory'
  },
  valuationMethod: {
    type: String,
    enum: ['FIFO', 'LIFO', 'WAC']
  },
  triggers: {
    onPOS: {
      type: Boolean,
      default: true
    },
    isPart: {
      type: Boolean,
      default: false
    }
  },
  isDelete: {
    type: Boolean,
    default: false
  }

}, { timestamps: true, skipVersioning: true })

export default tenantModel('ProductCategory', productCategorySchema)
