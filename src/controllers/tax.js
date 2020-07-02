import _TaxModel from '../models/tax'
import ERRORS from '../constants/errors'
import Joi from '@hapi/joi'
import { flatten } from 'flat'

const createSchema = Joi.object({
  name: Joi.string().required(),
  value: Joi.number().required(),
  unit: Joi.string().required(),
  default: Joi.boolean().optional(),
  status: Joi.boolean().optional()
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().optional(),
  value: Joi.number().optional(),
  unit: Joi.string().optional(),
  default: Joi.boolean().optional(),
  status: Joi.boolean().optional()
})

const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required()
})

export const getTaxes = async (req, res) => {
  try {
    const { page, limit } = req.query
    const data = await _TaxModel().paginate({ isDelete: false }, { page, limit })
    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createTax = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createSchema)
    if (validation.error) throw new Error(validation.error)
    const { name, ...rest } = req.body
    const tax = await _TaxModel().findOne({ name: { $regex: new RegExp(name), $options: 'i' }, isDelete: false })
    if (tax) {
      throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    if (rest.default) {
      await _TaxModel().updateMany({}, { $set: { default: false } })
    }
    const data = await _TaxModel().create({
      name, ...rest
    })

    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateTax = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)
    const { id: _id, ...rest } = req.body
    if (rest.name) {
      const existingTax = await _TaxModel().findOne({ name: { $regex: new RegExp(rest.name), $options: 'i' }, isDelete: false })
      if (existingTax && !existingTax._id.equals(_id)) {
        throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
      }
    }

    if (rest.default) {
      await _TaxModel().updateMany({}, { $set: { default: false } })
    }
    const data = await _TaxModel().findOneAndUpdate({ _id, isDelete: false }, { $set: flatten(rest) }, { new: true })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteTax = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id } = req.body

    await _TaxModel().updateMany({ _id: { $in: _id } }, { $set: { isDelete: true } })
    return res.json({ data: {} })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
