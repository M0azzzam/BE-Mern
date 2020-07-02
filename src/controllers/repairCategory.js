import _RepairCategoryModel from '../models/repairCategory'
import ERRORS from '../constants/errors'
import Joi from '@hapi/joi'
import { flatten } from 'flat'

const createSchema = Joi.object({
  name: Joi.string().required(),
  triggers: Joi.object({
    onPOS: Joi.boolean(),
    onWidget: Joi.boolean()
  }),
  manufacturers: Joi.array().unique((a, b) => a.manufacturer === b.manufacturer).min(1).required().items(Joi.object({
    manufacturer: Joi.string().required(),
    devices: Joi.array().unique().min(1).required().items(Joi.string()),
  })),
  imageUrl: Joi.string().optional().allow(''),
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string(),
  triggers: Joi.object({
    onPOS: Joi.boolean(),
    onWidget: Joi.boolean()
  }),
  manufacturers: Joi.array().unique((a, b) => a.manufacturer === b.manufacturer).min(1).required().items(Joi.object({
    manufacturer: Joi.string().required(),
    devices: Joi.array().unique().min(1).required().items(Joi.string()),
  })),
  imageUrl: Joi.string().optional().allow(''),
})
const updateTriggersSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required(),
  triggers: Joi.object({
    onPOS: Joi.boolean(),
    onWidget: Joi.boolean()
  }).required()
})
const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required()
})

export const getRepairCategories = async (req, res) => {
  try {
    const { page, limit } = req.query
    const data = await _RepairCategoryModel().paginate({ isDelete: false }, { page, limit, populate: [{ path: 'manufacturers.manufacturer', select: 'name' }, { path: 'manufacturers.devices', select: 'name' }] })
    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createRepairCategory = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createSchema)
    if (validation.error) throw new Error(validation.error)
    const { name, triggers, manufacturers, imageUrl } = req.body
    const repairCategory = await _RepairCategoryModel().findOne({ name: { $regex: new RegExp(name), $options: 'i' }, isDelete: false })
    if (repairCategory) {
      throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    const data = await _RepairCategoryModel().create({
      name,
      triggers,
      manufacturers,
      imageUrl
    })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateRepairCategory = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)
    const { id: _id, ...rest } = req.body

    if (rest.name) {
      const existingRepairCatergory = await _RepairCategoryModel().findOne({ name: { $regex: new RegExp(rest.name), $options: 'i' }, isDelete: false })
      if (existingRepairCatergory && !existingRepairCatergory._id.equals(_id)) {
        throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
      }
    }
    if (rest.triggers) {
      rest.triggers = flatten(rest.triggers)
    }
    const data = await _RepairCategoryModel().findOneAndUpdate({ _id, isDelete: false }, { $set: rest }, { new: true })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteRepairCategory = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id } = req.body
    await _RepairCategoryModel().updateMany({ _id: { $in: _id } }, { $set: { isDelete: true } })
    return res.json({ data: {} })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateRepairCategoriesTriggers = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateTriggersSchema)
    if (validation.error) throw new Error(validation.error)
    const { id: _id, ...rest } = req.body

    const data = await _RepairCategoryModel().updateMany({ _id: { $in: _id } }, { $set: flatten(rest) })
    return res.json({})
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
