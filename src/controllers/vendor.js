import _VendorModel from '../models/vendor'
import ERRORS from '../constants/errors'
import Joi from '@hapi/joi'
import { flatten } from 'flat'

const createSchema = Joi.object({
  name: Joi.string().required(),
  vendorCode: Joi.string().required(),
  email: Joi.string().optional().allow(''),
  website: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  mobile: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  postCode: Joi.string().optional().allow(''),
  doubleTax: Joi.boolean().optional().allow(''),
  skuReminderDate: Joi.string().optional().allow('')
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  vendorCode: Joi.string().optional().allow(''),
  email: Joi.string().optional().allow(''),
  website: Joi.string().optional().allow(''),
  phone: Joi.string().optional().allow(''),
  mobile: Joi.string().optional().allow(''),
  address: Joi.string().optional().allow(''),
  postCode: Joi.string().optional().allow(''),
  doubleTax: Joi.boolean().optional().allow(''),
  skuReminderDate: Joi.string().optional().allow('')
})

const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required()
})

export const getVendors = async (req, res) => {
  try {
    const { page, limit } = req.query
    const data = await _VendorModel().paginate({ isDelete: false }, { page, limit })
    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createVendor = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createSchema)
    if (validation.error) throw new Error(validation.error)
    const { name, ...rest } = req.body
    const vendor = await _VendorModel().findOne({ name: { $regex: new RegExp(name), $options: 'i' }, isDelete: false })
    if (vendor) {
      throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    const data = await _VendorModel().create({
      name, ...rest
    })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateVendor = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)
    const { id: _id, ...rest } = req.body
    if (rest.name) {
      const existingVendor = await _VendorModel().findOne({ name: { $regex: new RegExp(rest.name), $options: 'i' }, isDelete: false })
      if (existingVendor && !existingVendor._id.equals(_id)) {
        throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
      }
    }

    const data = await _VendorModel().findOneAndUpdate({ _id, isDelete: false }, { $set: flatten(rest) }, { new: true })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteVendor = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id } = req.body

    await _VendorModel().updateMany({ _id: { $in: _id } }, { $set: { isDelete: true } })
    return res.json({ data: {} })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
