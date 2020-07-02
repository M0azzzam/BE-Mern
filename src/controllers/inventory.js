import _InventoryModel from '../models/inventory'
import _InventoryStockModel from '../models/inventoryStock'
import ERRORS from '../constants/errors'
import Joi from '@hapi/joi'
import { flatten } from 'flat'

const createSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  type: Joi.string().valid(['Service', 'Product']).required(),
  taxExempt: Joi.boolean(),
  inventoryStock: Joi.object({
    unitCost: Joi.number(),
    quantity: Joi.number(),
    reOrderLevel: Joi.number(),
  }).optional().allow({})
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  type: Joi.string().valid(['Service', 'Product']),
  taxExempt: Joi.boolean(),
  inventoryStock: Joi.object({
    unitCost: Joi.number(),
    quantity: Joi.number(),
    reOrderLevel: Joi.number(),
  }).optional().allow({})
})

const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required()
})

const searchSchema = Joi.object({
  text: Joi.string().optional().allow(''),
  page: Joi.optional(),
  limit: Joi.optional()
})

export const getInventories = async (req, res) => {
  try {
    const { page, limit } = req.query
    const data = await _InventoryModel().paginate({ isDelete: false }, { page, limit, populate: [{ path: 'inventoryStock', select: 'unitCost quantity reOrderLevel storeId' }] })
    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createInventory = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createSchema)
    if (validation.error) throw new Error(validation.error)
    const { body: { name, inventoryStock, ...rest }, storeId } = req;

    const inventory = await _InventoryModel().findOne({ name: { $regex: new RegExp(name), $options: 'i' }, isDelete: false })
    if (inventory) {
      throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }
    let stock = {}
    let inventoryData = {
      name,
      ...rest,
    }

    if (rest.type === 'Product') {
      stock = await _InventoryStockModel().create({ storeId, ...inventoryStock })
      inventoryData.inventoryStock = stock._id
    }

    const data = await _InventoryModel().create(inventoryData)
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateInventory = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)
    const { id: _id, inventoryStock, ...rest } = req.body
    if (rest.name) {
      const inventory = await _InventoryModel().findOne({ name: { $regex: new RegExp(rest.name), $options: 'i' }, isDelete: false })
      if (inventory && !inventory._id.equals(_id)) {
        throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
      }
    }
    const data = await _InventoryModel().findOneAndUpdate({ _id, isDelete: false }, { $set: flatten(rest) }, { new: true })
    const stock = await _InventoryStockModel().findOneAndUpdate({ _id: data.inventoryStock }, { $set: flatten(inventoryStock) }, { new: true })
    data.inventoryStock = stock
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteInventories = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id } = req.body
    await _InventoryModel().updateMany({ _id: { $in: _id } }, { $set: { isDelete: true } })
    return res.json({ data: {} })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const searchInventory = async (req, res) => {
  try {
    const validation = Joi.validate(req.query, searchSchema)
    if (validation.error) throw new Error(validation.error)

    const { text = '' } = req.query
    if (!text) return res.json({ data: [] })

    const nameStr = text.split(' ').join('|')
    const nameRegex = new RegExp(`${nameStr}`)

    const data = await _InventoryModel().find({ isDelete: false, name: { $regex: nameRegex, $options: 'i' } }).populate([{ path: 'inventoryStock', select: 'unitCost quantity reOrderLevel storeId' }])
    return res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
