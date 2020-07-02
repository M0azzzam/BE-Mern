import _PhysicalLocationModel from '../models/physicalLocation'
import ERRORS from '../constants/errors'
import Joi from '@hapi/joi'
import { flatten } from 'flat'

const createSchema = Joi.object({
  name: Joi.string().required(),
  isDefault: Joi.boolean(),
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  isDefault: Joi.boolean(),
})

const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required(),
})


export const getPhysicalLocations = async (req, res) => {
  try {
    const { page, limit } = req.query
    const data = await _PhysicalLocationModel().paginate({ isDelete: false }, { page, limit, select: '-isDelete' })

    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createPhysicalLocation = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createSchema)
    if (validation.error) throw new Error(validation.error)

    const existingPhysicalLocation = await _PhysicalLocationModel().findOne({ name: { $regex: new RegExp(`^${req.body.name}$`), $options: 'i' }, isDelete: false })
    if (existingPhysicalLocation) {
      throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    const { body, storeId } = req;
    const data = await _PhysicalLocationModel().create({ ...body, storeId })

    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updatePhysicalLocation = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id, ...rest } = req.body
    if (rest.name) {
      const existingPhysicalLocation = await _PhysicalLocationModel().findOne({ name: { $regex: new RegExp(rest.name), $options: 'i' }, isDelete: false })
      if (existingPhysicalLocation && !existingPhysicalLocation._id.equals(_id)) {
        throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
      }
    }

    const data = await _PhysicalLocationModel().findOneAndUpdate({ _id, isDelete: false }, { $set: flatten(rest) }, { new: true })

    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deletePhysicalLocation = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: ids } = req.body
    const data = await _PhysicalLocationModel().updateMany({ _id: { $in: ids } }, { $set: { isDelete: true } }, { new: true })

    return res.json({ data })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
