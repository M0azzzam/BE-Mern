import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const roleSchema = new Schema({
  name: String,
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  isSuper: {
    type: Boolean,
    default: false
  },
  permissions: [
    {
      module: String,
      access: {
        type: Boolean,
        default: true
      },
      edit: {
        type: Boolean,
        default: true
      },
      delete: {
        type: Boolean,
        default: true
      },
      actions: Object
    }
  ]
}, { timestamps: true, skipVersioning: true })

export default tenantModel('Role', roleSchema)
