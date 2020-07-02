import _InvoiceModel from '../models/invoice'
import Joi from '@hapi/joi'
import { flatten } from 'flat'

const createSchema = Joi.object({
  invoiceNumber: Joi.number().required(),
  estimateId: Joi.number().optional().allow(''),
  name: Joi.string().required(),
  client: Joi.string().required(),
  propertyAddress: Joi.object().required(),
  lineItems: Joi.array().items({
    item: Joi.string().required(),
    qty: Joi.number().required(),
    unitCost: Joi.number().required()
  }).optional().allow([]),
  discount: Joi.object({
    type: Joi.string(),
    value: Joi.number()
  }).optional().allow({}),
  tax: Joi.string().optional().allow(''),
  clientMessage: Joi.string().optional().allow('')
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  invoiceNumber: Joi.number(),
  estimateId: Joi.number(),
  name: Joi.string(),
  client: Joi.string(),
  propertyAddress: Joi.object(),
  lineItems: Joi.array().items({
    item: Joi.string(),
    qty: Joi.number(),
    unitCost: Joi.number()
  }).optional().allow([]),
  discount: Joi.object({
    type: Joi.string(),
    value: Joi.number()
  }).optional().allow({}),
  tax: Joi.string().optional().allow(''),
  clientMessage: Joi.string().optional().allow('')
})

const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required()
})

export const getInvoices = async (req, res) => {
  try {
    const { page, limit, id: _id } = req.query
    if (_id) {
      const data = await _InvoiceModel().findOne({ isDelete: false, _id }).populate([{ path: 'client', select: 'firstName lastName email' }, { path: 'lineItems.item', select: 'type name description taxExempt inventoryStock' }, { path: 'tax' }])
      return res.json({ data })
    } else {
      const data = await _InvoiceModel().paginate({ isDelete: false }, { page, limit, populate: [{ path: 'client', select: 'firstName lastName email' }, { path: 'lineItems.item', select: 'type name description taxExempt inventoryStock' }, { path: 'tax' }] })
      return res.json(data)
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createInvoice = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createSchema)
    if (validation.error) throw new Error(validation.error)
    const { storeId } = req;

    const data = await _InvoiceModel().create({ ...req.body, storeId })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateInvoice = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)
    const { id: _id, ...rest } = req.body
    const data = await _InvoiceModel().findOneAndUpdate({ _id, isDelete: false }, { $set: flatten(rest) }, { new: true })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteInvoice = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id } = req.body
    await _InvoiceModel().updateMany({ _id: { $in: _id } }, { $set: { isDelete: true } })
    return res.json({ data: {} })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
