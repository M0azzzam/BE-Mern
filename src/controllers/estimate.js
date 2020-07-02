import _EstimateModel from '../models/estimate'
import _JobModel from '../models/job'
import ERRORS from '../constants/errors';
import Joi from '@hapi/joi'
import { flatten } from 'flat'

const createSchema = Joi.object({
  estimateId: Joi.number().required(),
  name: Joi.string().optional().allow(''),
  client: Joi.string().optional().allow(''),
  propertyAddress: Joi.object().required(),
  lineItems: Joi.array().items({
    item: Joi.string().required(),
    qty: Joi.number().required(),
    unitCost: Joi.number().required(),
    description: Joi.string().allow('')
  }).optional().allow([]),
  discount: Joi.object({
    type: Joi.string(),
    value: Joi.number()
  }).optional().allow({}),
  tax: Joi.string().optional().allow(''),
  poso: Joi.string().optional().allow(''),
  issueDate: Joi.string().optional().allow(''),
  clientMessage: Joi.string().optional().allow(''),
  staffMessage: Joi.string().optional().allow(''),
  deposit: Joi.optional(),
  forceUpdate: Joi.boolean().optional()
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  estimateId: Joi.number().required(),
  name: Joi.string().optional().allow(''),
  client: Joi.string().optional().allow(''),
  propertyAddress: Joi.object(),
  lineItems: Joi.array().items({
    item: Joi.string(),
    qty: Joi.number(),
    unitCost: Joi.number(),
    description: Joi.string().allow('')
  }).optional().allow([]),
  discount: Joi.object({
    type: Joi.string(),
    value: Joi.number()
  }).optional().allow({}),
  tax: Joi.string().optional().allow(''),
  poso: Joi.string().optional().allow(''),
  issueDate: Joi.string().optional().allow(''),
  clientMessage: Joi.string().optional().allow(''),
  staffMessage: Joi.string().optional().allow(''),
  deposit: Joi.optional(),
  forceUpdate: Joi.boolean().optional()
})

const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required()
})

const updateEsitmateStatusSchema = Joi.object({
  id: Joi.string().required(),
  status: Joi.string().valid('DRAFT', 'AWAITING', 'APPROVED', 'CONVERTED', 'ARCHIVED').required()
})

const convertEstimateToJobSchema = Joi.object({
  id: Joi.string().required()
})

const formatSortData = (sort = []) => {
  if (!sort || sort.length === 0) return {};
  return sort.reduce((s, item) => {
    const [key, value] = item.split('.')
    switch (value) {
      case 'asc':
        return { ...s, [key]: 1 }
      case 'desc':
        return { ...s, [key]: -1 }
      default:
        return s
    }
  }, {})
}

const getNewJobNumber = async () => {
  const data = await _JobModel().findOne({}, {}, { sort: { jobId: -1 } })
  if (!data) return 1;
  return (parseInt(data.jobId) + 1);
}

export const getEstimates = async (req, res) => {
  try {
    const { page, limit, id: _id, status, customerId, dateFrom, dateTo, text, sort = [] } = req.query
    if (_id) {
      const data = await _EstimateModel().findOne({ isDelete: false, _id }).populate([{ path: 'client' }, { path: 'lineItems.item', select: 'type name description taxExempt inventoryStock' }, { path: 'tax' }])
      return res.json({ data })
    } else {
      /**
       * Filters
       */
      let filter = { $and: [] }
      /**
       * Sorts
       */
      let sorts = formatSortData(sort)

      if (status) filter.$and.push({ status })
      if (customerId) filter.$and.push({ client: customerId })
      if (dateFrom) filter.$and.push({ createdAt: { $gte: new Date(dateFrom) } })
      if (dateTo) filter.$and.push({ createdAt: { $lte: new Date(dateTo) } })
      if (text) filter.$and.push({
        $or: [
          {
            estimateId: text
          },
          {
            name: {
              $regex: new RegExp(text.split(' ').join('|')),
              $options: 'i'
            }
          }
        ]
      })

      if (filter.$and.length === 0) filter = {};

      const data = await _EstimateModel().paginate({ isDelete: false, ...filter }, { page, limit, sort: { ...sorts }, populate: [{ path: 'client' }, { path: 'lineItems.item', select: 'type name description taxExempt inventoryStock' }, { path: 'tax' }] })
      return res.json(data)
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const createEstimate = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createSchema)
    if (validation.error) throw new Error(validation.error)
    const { storeId } = req
    const { forceUpdate, ...rest } = req.body
    if (!forceUpdate) {
      const existing = await _EstimateModel().findOne({ estimateId: rest.estimateId })
      if (existing) throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    const data = await _EstimateModel().create({ ...rest, storeId })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateEstimate = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id, forceUpdate, ...rest } = req.body
    if (!forceUpdate) {
      const found = await _EstimateModel().findOne({ estimateId: rest.estimateId, _id: { $ne: _id } })
      if (found) {
        throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
      }
    }
    const data = await _EstimateModel().findOneAndUpdate({ _id, isDelete: false }, { $set: flatten(rest) }, { new: true })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteEstimates = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id } = req.body
    await _EstimateModel().updateMany({ _id: { $in: _id } }, { $set: { isDelete: true } })
    return res.json({ data: {} })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const getNextEstimateNumber = async (req, res) => {
  try {
    const result = await _EstimateModel().findOne({}, {}, { sort: { estimateId: -1 } })
    if (!result) return res.json({ data: { estimateId: 1 } })
    return res.json({ data: { estimateId: parseInt(result.estimateId) + 1 } })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateEsitmateStatus = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateEsitmateStatusSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id, status } = req.body
    const result = await _EstimateModel().findOneAndUpdate({ _id, isDelete: false }, { $set: { status } }, { new: true })
    return res.json({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const convertEstimateToJob = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, convertEstimateToJobSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id } = req.body

    const newJobNumber = await getNewJobNumber()
    const result = await _EstimateModel().findOneAndUpdate({ _id, isDelete: false, status: { $ne: 'CONVERTED' } }, { $set: { status: 'CONVERTED' } }, { new: true })
    if (!result) throw new Error(ERRORS.RESOURCE_NOT_FOUND)

    const { client, lineItems, propertyAddress, storeId } = result
    const expenses = lineItems.map((lineItem) => {
      const { _doc: { _id, ...rest } } = lineItem
      return {
        lineItem: {
          ...rest
        }
      }
    })

    const data = await _JobModel().create({
      jobId: newJobNumber,
      title: 'From Estimate',
      description: 'Estimate converted to Job',
      client,
      serviceAddress: { ...propertyAddress },
      storeId,
      expenses
    })

    return res.json({ data })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
