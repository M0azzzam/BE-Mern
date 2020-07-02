import _UserModel from '../models/user'
import Joi from '@hapi/joi'
import ERRORS from '../constants/errors'

const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
  country: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  zip: Joi.string().optional().allow(''),
  defaultStore: Joi.string().required(),
  role: Joi.string().required(),
  accessPin: Joi.string().required()
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).optional().allow(''),
  country: Joi.string().optional().allow(''),
  city: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  zip: Joi.string().optional().allow(''),
  defaultStore: Joi.string().required(),
  role: Joi.string().required(),
  accessPin: Joi.string().required()
})

const deleteSchema = Joi.object({
  id: Joi.string().required()
})

export const getEmployees = async (req, res) => {
  try {
    const business = req.user.business
    const { page, limit } = req.query
    const data = await _UserModel().paginate({ business, isDelete: false, isSuper: false }, { page, limit, populate: 'role' })
    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createEmployee = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, registerSchema)
    if (validation.error) throw new Error(validation.error)
    const business = req.user.business
    const { name, email, password, country, city, phone, address, zip, defaultStore, role, accessPin } = req.body

    const existingUser = await _UserModel().findOne({ business, email })
    if (existingUser) {
      throw new Error(ERRORS.EMAIL_ALREADY_EXISTS)
    }

    const data = await _UserModel().create({
      name,
      email,
      password,
      business: req.user.business,
      defaultStore,
      role,
      accessPin,
      country,
      city,
      phone,
      address,
      zip,
      isActive: true,
    })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.EMAIL_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateEmployee = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id, name, email, password, country, city, phone, address, zip, defaultStore, role, accessPin } = req.body
    const toUpdate = {
      name,
      email,
      password,
      business: req.user.business,
      defaultStore,
      role,
      accessPin,
      country,
      city,
      phone,
      address,
      zip,
      isActive: true,
    };

    if (!password) delete toUpdate.password;
    if (email) {
      const existingUser = await _UserModel().findOne({ email, business: req.user.business })
      if (existingUser && !existingUser._id.equals(_id)) {
        throw new Error(ERRORS.EMAIL_ALREADY_EXISTS)
      }
    }
    const data = await _UserModel().findOneAndUpdate({ business: req.user.business, _id }, toUpdate)
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.EMAIL_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteEmployee = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id } = req.body
    const business = req.user.business

    await _UserModel().findOneAndUpdate({ _id, business }, { $set: { isDelete: true } })
    return res.json({ data: {} })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
