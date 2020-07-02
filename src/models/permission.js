import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const permissionSchema = new Schema({
  module: String,
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
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
}, { timestamps: true, skipVersioning: true })

export default tenantModel('Permission', permissionSchema)
