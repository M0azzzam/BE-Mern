import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const clientSchema = new Schema({
  title: {
    type: String,
    enum: ['Mr.', 'Ms.', 'Mrs.', 'Miss.', 'Dr.', '']
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  company: String,
  email: String,
  homePhone: [String],
  workPhone: [String],
  mobile: [String],
  address: String,
  propertyDetails: {
    street1: String,
    street2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    additional: Object
  },
  billingAddress: {
    street1: String,
    street2: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    additional: Object
  },
  billingAndPropertyAddressSame: Boolean,
  companyNameAsPrimary: {
    type: Boolean,
    default: false
  },
  tax: {
    type: Schema.Types.ObjectId,
    ref: 'Tax'
  },
  isDelete: {
    type: Boolean,
    default: false
  }

}, { timestamps: true, skipVersioning: true })

export default tenantModel('Client', clientSchema)
