import _ClientModel from '../models/client'
import ERRORS from '../constants/errors'
import Joi from '@hapi/joi'
import { flatten } from 'flat'

const createSchema = Joi.object({
  title: Joi.string().optional().allow(''),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  company: Joi.string().optional().allow(''),
  email: Joi.string().optional().allow(''),
  homePhone: Joi.array().items(Joi.string().optional().allow('')).optional().allow([]),
  workPhone: Joi.array().items(Joi.string().optional().allow('')).optional().allow([]),
  mobile: Joi.array().items(Joi.string().optional().allow('')).optional().allow([]),
  propertyDetails: Joi.object({
    street1: Joi.string().optional().allow(''),
    street2: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    zipCode: Joi.string().optional().allow(''),
    country: Joi.string().optional().allow(''),
    additional: Joi.object().optional()
  }).optional().allow({}),
  billingAddress: Joi.object({
    street1: Joi.string().optional().allow(''),
    street2: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    zipCode: Joi.string().optional().allow(''),
    country: Joi.string().optional().allow(''),
    additional: Joi.object().optional()
  }).optional().allow({}),
  billingAndPropertyAddressSame: Joi.boolean(),
  companyNameAsPrimary: Joi.boolean().optional(),
  tax: Joi.string().optional().allow('')
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  title: Joi.string().optional().allow(''),
  firstName: Joi.string(),
  lastName: Joi.string(),
  company: Joi.string().optional().allow(''),
  email: Joi.string().optional().allow(''),
  homePhone: Joi.array().items(Joi.string().optional().allow('')).optional().allow([]),
  workPhone: Joi.array().items(Joi.string().optional().allow('')).optional().allow([]),
  mobile: Joi.array().items(Joi.string().optional().allow('')).optional().allow([]),
  propertyDetails: Joi.object({
    street1: Joi.string().optional().allow(''),
    street2: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    zipCode: Joi.string().optional().allow(''),
    country: Joi.string().optional().allow(''),
    additional: Joi.object().optional()
  }).optional().allow({}),
  billingAddress: Joi.object({
    street1: Joi.string().optional().allow(''),
    street2: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    state: Joi.string().optional().allow(''),
    zipCode: Joi.string().optional().allow(''),
    country: Joi.string().optional().allow(''),
    additional: Joi.object().optional()
  }).optional().allow({}),
  billingAndPropertyAddressSame: Joi.boolean(),
  companyNameAsPrimary: Joi.boolean().optional(),
  tax: Joi.string().optional().allow('')
})

const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required()
})

export const getClients = async (req, res) => {
  try {
    const { page, limit } = req.query
    const data = await _ClientModel().paginate({ isDelete: false }, { page, limit, populate: 'tax' })
    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const searchClients = async (req, res) => {
  try {
    const { page, limit, text = '' } = req.query

    if (!text) return res.json({ data: [] })

    const searchRE = new RegExp(`.*${text}.*`);
    const data = await _ClientModel().find({
      $or: [
        {
          firstName: { $regex: searchRE, $options: 'i' }
        },
        {
          lastName: { $regex: searchRE, $options: 'i' }
        },
        {
          email: { $regex: searchRE, $options: 'i' }
        },
        {
          mobile: { $elemMatch: { $regex: searchRE, $options: 'i' } }
        }
      ],
      isDelete: false
    })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createClient = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createSchema)
    if (validation.error) throw new Error(validation.error)
    const { name, ...rest } = req.body
    const vendor = await _ClientModel().findOne({ name: { $regex: new RegExp(name), $options: 'i' }, isDelete: false })
    if (vendor) {
      throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    const data = await _ClientModel().create({
      name, ...rest
    })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateClient = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)
    const { id: _id, ...rest } = req.body
    if (rest.name) {
      const existingVendor = await _ClientModel().findOne({ name: { $regex: new RegExp(rest.name), $options: 'i' }, isDelete: false })
      if (existingVendor && !existingVendor._id.equals(_id)) {
        throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
      }
    }

    const data = await _ClientModel().findOneAndUpdate({ _id, isDelete: false }, { $set: flatten(rest) }, { new: true })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteClient = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id } = req.body

    await _ClientModel().updateMany({ _id: { $in: _id } }, { $set: { isDelete: true } })
    return res.json({ data: {} })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
