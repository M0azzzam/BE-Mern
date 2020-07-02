import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const vendorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  vendorCode: {
    type: String,
    required: true
  },
  email: String,
  website: String,
  phone: String,
  mobile: String,
  address: String,
  postCode: String,
  doubleTax: {
    type: Boolean,
    default: false
  },
  skuReminderDate: Date,
  isDelete: {
    type: Boolean,
    default: false
  }

}, { timestamps: true, skipVersioning: true })

export default tenantModel('Vendor', vendorSchema)
