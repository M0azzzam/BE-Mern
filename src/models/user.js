import { Schema } from 'mongoose'
import bcrypt from 'bcryptjs'
import { tenantlessModel } from '../lib/multiTenant'

export const userSchema = new Schema({
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
  defaultStore: {
    type: Schema.Types.ObjectId,
    ref: 'Store'
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isDelete: {
    type: Boolean,
    default: false
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'Role'
  },
  accessPin: {
    type: String
  },
  phone: String,
  mobile: String,
  address: String,
  city: String,
  state: String,
  zip: String,
  country: String,
  isSuper: {
    type: Boolean,
    default: false
  }
}, { timestamps: true, skipVersioning: true })

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next()
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10)
    user.password = hashedPassword
    next()
  } catch (err) {
    console.log(err)
    next(err)
  }
})

userSchema.pre('findOneAndUpdate', async function (next) {
  if (!this._update.password) return next()
  try {
    const hashedPassword = await bcrypt.hash(this._update.password, 10)
    this._update.password = hashedPassword
    next()
  } catch (err) {
    console.log(err)
    next(err)
  }
})

export default tenantlessModel('User', userSchema)
