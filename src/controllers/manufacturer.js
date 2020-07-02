import _ManufacturerModel from '../models/manufacturer'
import Joi from '@hapi/joi'
import flatten from 'flat'
import ERRORS from '../constants/errors'

const manufacturerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  imageUrl: Joi.string().optional().allow(''),
  triggers: Joi.object().optional(),
})

const updateTriggersSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required(),
  triggers: Joi.object({
    onPOS: Joi.boolean(),
    onWidget: Joi.boolean()
  }).required()
})

export const getManufacturers = async (req, res) => {
  try {
    const { limit, page } = req.query
    const data = await _ManufacturerModel().paginate({ isDelete: false }, { limit, page, select: '-isDelete -tenantId' })

    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createManufacturer = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, manufacturerSchema)
    if (validation.error) throw new Error(validation.error)

    const existing = await _ManufacturerModel().findOne({ name: { $regex: new RegExp(`^${req.body.name}$`), $options: 'i' }, isDelete: false })
    if (existing) {
      throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    const data = await _ManufacturerModel().create(req.body)
    return res.json({ data })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateManufacturer = async (req, res) => {
  try {
    const { id: _id, ...rest } = req.body
    const data = await _ManufacturerModel().findOneAndUpdate({ _id }, { $set: flatten(rest) }, { new: true })

    return res.json({ data })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteManufacturer = async (req, res) => {
  try {
    const { id: ids } = req.body
    const data = await _ManufacturerModel().updateMany({ _id: { $in: ids } }, { $set: { isDelete: true } }, { new: true })

    return res.json({ data })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateManufacturerTriggers = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateTriggersSchema)
    if (validation.error) throw new Error(validation.error)
    const { id: _id, ...rest } = req.body

    const data = await _ManufacturerModel().updateMany({_id:{$in:_id}}, { $set: flatten(rest) }, { new: true })
    return res.json({})
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

