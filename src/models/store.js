import { Schema } from 'mongoose'
import { tenantModel } from '../lib/multiTenant'

const storeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  business: {
    type: Schema.Types.ObjectId,
    ref: 'Business'
  },
  alternateName: {
    type: String,
    default: ''
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  logo: {
    type: String,
    default: ''
  },
  storeType: {
    type: Schema.Types.ObjectId,
    ref: 'StoreType'
  },
  isDefault: Boolean,
  phone: String,
  mobile: String,
  fax: String,
  website: String,
  address: String,
  city: String,
  postCode: String,
  state: String,
  country: String,
  timeZone: String,
  timeFormat: String,
  language: String,
  defaultCurrency: String,
  priceFormat: String,
  phoneFormat: String,
  chargeSalesTax: Boolean,
  defaultTaxClass: String,
  taxPercentage: Number,
  taxIncluded: Boolean,
  registrationNumber: String,
  startTime: String,
  endTime: String,
  defaultAddress: String,
  syncPricesOnAll: Boolean,
  syncNewItemsOnAllStores: Boolean,
  apiKey: String,
  franchiseFeeCriteria: Number,
  franchiseFeePercentage: Number
}, { timestamps: true, skipVersioning: true })

export default tenantModel('Store', storeSchema)
