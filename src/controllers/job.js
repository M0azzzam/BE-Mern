import _JobModel from '../models/job'
import ERRORS from '../constants/errors'
import Joi from '@hapi/joi'

const createSchema = Joi.object({
  jobId: Joi.number().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  jobType: Joi.string().valid('non-recurring', 'recurring').optional(),
  client: Joi.string().required(),
  serviceAddress: Joi.object().optional().allow({}),
  status: Joi.string().valid('scheduled', 'unscheduled', 'inprogress', 'completed', 'onhold', 'cancelled', 'no-invoice').optional(),
  expenses: Joi.array().items({
    supplier: Joi.string().optional(),
    technician: Joi.string().optional(),
    description: Joi.string().optional().allow(''),
    date: Joi.string().optional().allow(''),
    purchaseOrder: Joi.string().optional().allow(''),
    receipt: Joi.string().optional().allow(''),
    paymentType: Joi.string().valid('cash', 'credit-card'),
    qty: Joi.number().optional().allow(''),
    amount: Joi.number().optional().allow(''),
    chargeToCustomer: Joi.boolean().optional(),
    chargeType: Joi.string().valid('time-expense', 'expense-against-casual-items', 'casual').optional(),
    lineItem: Joi.object({
      item: Joi.string().required(),
      description: Joi.string().required(),
      unitCost: Joi.number().required(),
      qty: Joi.number().required()
    }).required()
  }),
  technicians: Joi.array().items({
    technician: Joi.string().required(),
    status: Joi.string().valid('on-way').optional(),
    checkIn: Joi.string().optional().allow(''),
    checkOut: Joi.string().optional().allow('')
  }).optional().allow([]),
  schedule: Joi.array().items({
    title: Joi.string().optional().allow(''),
    instructions: Joi.string().optional().allow(''),
    startDateTime: Joi.string().optional().allow(''),
    endDatetime: Joi.string().optional().allow(''),
    assignedTo: Joi.array().items({
      technician: Joi.string().required()
    }).optional().allow([])
  }).optional().allow([]),
  attachments: Joi.array().items({
    fileName: Joi.string().optional(),
    mimeType: Joi.string().optional(),
    location: Joi.string().optional()
  }).optional().allow([]),
  reminder: Joi.object({
    type: Joi.string().valid('call', 'email', 'visit').required(),
    subject: Joi.string().optional().allow(''),
    dateTime: Joi.string().optional().allow(''),
    assignedTo: Joi.array().items({
      technician: Joi.string().optional()
    }),
    comments: Joi.string().optional().allow('')
  }).optional().allow({}),
  internalNotes: Joi.object({
    to: Joi.string().optional(),
    via: Joi.string().valid('sms', 'email').required(),
    subject: Joi.string().optional().allow(''),
    comments: Joi.string().optional().allow('')
  }).optional().allow({}),
  clientsPreferences: Joi.object({
    to: Joi.string().optional(),
    via: Joi.string().valid('sms', 'email').required(),
    subject: Joi.string().optional().allow(''),
    message: Joi.string().optional().allow('')
  }).optional().allow({})
})

const updateSchema = Joi.object({
  id: Joi.string().required(),
  jobId: Joi.number().required(),
  title: Joi.string().required(),
  description: Joi.string().required(),
  jobType: Joi.string().valid('non-recurring', 'recurring').optional(),
  client: Joi.string().required(),
  serviceAddress: Joi.object().optional().allow({}),
  status: Joi.string().valid('scheduled', 'unscheduled', 'inprogress', 'completed', 'onhold', 'cancelled', 'no-invoice').optional(),
  expenses: Joi.array().items({
    supplier: Joi.string().optional(),
    technician: Joi.string().optional(),
    description: Joi.string().optional().allow(''),
    date: Joi.string().optional().allow(''),
    purchaseOrder: Joi.string().optional().allow(''),
    receipt: Joi.string().optional().allow(''),
    paymentType: Joi.string().valid('cash', 'credit-card'),
    qty: Joi.number().optional().allow(''),
    amount: Joi.number().optional().allow(''),
    chargeToCustomer: Joi.boolean().optional(),
    chargeType: Joi.string().valid('time-expense', 'expense-against-casual-items', 'casual').optional(),
    lineItem: Joi.object({
      item: Joi.string().required(),
      description: Joi.string().required(),
      unitCost: Joi.number().required(),
      qty: Joi.number().required()
    }).required()
  }),
  technicians: Joi.array().items({
    technician: Joi.string().required(),
    status: Joi.string().valid('on-way').optional(),
    checkIn: Joi.string().optional().allow(''),
    checkOut: Joi.string().optional().allow('')
  }).optional().allow([]),
  schedule: Joi.array().items({
    title: Joi.string().optional().allow(''),
    instructions: Joi.string().optional().allow(''),
    startDateTime: Joi.string().optional().allow(''),
    endDatetime: Joi.string().optional().allow(''),
    assignedTo: Joi.array().items({
      technician: Joi.string().required()
    }).optional().allow([])
  }).optional().allow([]),
  attachments: Joi.array().items({
    fileName: Joi.string().optional(),
    mimeType: Joi.string().optional(),
    location: Joi.string().optional()
  }).optional().allow([]),
  reminder: Joi.object({
    type: Joi.string().valid('call', 'email', 'visit').required(),
    subject: Joi.string().optional().allow(''),
    dateTime: Joi.string().optional().allow(''),
    assignedTo: Joi.array().items({
      technician: Joi.string().optional()
    }),
    comments: Joi.string().optional().allow('')
  }).optional().allow({}),
  internalNotes: Joi.object({
    to: Joi.string().optional(),
    via: Joi.string().valid('sms', 'email').required(),
    subject: Joi.string().optional().allow(''),
    comments: Joi.string().optional().allow('')
  }).optional().allow({}),
  clientsPreferences: Joi.object({
    to: Joi.string().optional(),
    via: Joi.string().valid('sms', 'email').required(),
    subject: Joi.string().optional().allow(''),
    message: Joi.string().optional().allow('')
  }).optional().allow({})
})

const updateStatusSchema = Joi.object({
  id: Joi.string().required(),
  status: Joi.string().valid('scheduled', 'un-scheduled', 'in-progress', 'completed', 'on-hold', 'cancelled', 'no-invoice').required()
})

const deleteSchema = Joi.object({
  id: Joi.array().items(Joi.string()).required()
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

const isNumber = (text) => {
  const data = parseInt(text)
  if (typeof data === 'number' && !Number.isNaN(data)) return data

  return ''
}

export const createJob = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, createSchema)
    if (validation.error) throw new Error(validation.error)

    const { storeId } = req
    const { forceUpdate, ...rest } = req.body
    if (!forceUpdate) {
      const found = await _JobModel().findOne({ jobId: rest.jobId })
      if (found) throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    const data = await _JobModel().create({ ...rest, storeId })
    return res.status(200).json({ data })
  } catch (err) {
    console.log(err)
    if (err.message === ERRORS.RESOURCE_ALREADY_EXISTS) return res.status(409).json({ error: true, reason: err.message })
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateJob = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)

    const { forceUpdate, id: _id, ...rest } = req.body
    if (!forceUpdate) {
      const result = await _JobModel().findOne({ jobId: rest.jobId, _id: { $ne: _id } })
      if (result) throw new Error(ERRORS.RESOURCE_ALREADY_EXISTS)
    }

    const result = await _JobModel().findOneAndUpdate({ _id, isDelete: false }, { $set: { ...rest } }, { new: true })
    return res.json({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const getJobs = async (req, res) => {
  try {
    const { page, limit, id: _id, text, status, customerId, dateFrom, dateTo, sort = [] } = req.query

    if (_id) {
      const result = await _JobModel().findOne({ _id, isDelete: false }).populate([{ path: 'client' }, { path: 'expenses.lineItem.item', select: 'type name description taxExempt inventoryStock' }, { path: 'technicians.technician' }])
      return res.json({ data: result })
    } else {

      let filter = { $and: [] }

      let sorts = formatSortData(sort)

      if (status) filter.$and.push({ status })
      if (customerId) filter.$and.push({ client: customerId })
      if (dateFrom) filter.$and.push({ createdAt: { $gte: new Date(dateFrom) } })
      if (dateTo) filter.$and.push({ createdAt: { $lte: new Date(dateTo) } })
      if (text) {
        filter.$and.push({
          $or: [
            {
              jobId: isNumber(text)
            },
            {
              title: {
                $regex: new RegExp(text.split(' ').join('|')),
                $options: 'i'
              }
            }
          ]
        })
      }

      if (filter.$and.length === 0) filter = {};

      const data = await _JobModel().paginate({ isDelete: false, ...filter }, { page, limit, sort: { ...sorts }, populate: [{ path: 'client' }, { path: 'lineItems.item', select: 'type name description taxExempt inventoryStock' }, { path: 'technicians.technician' }] })
      return res.json(data)
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const getNextJobNumber = async (req, res) => {
  try {
    const result = await _JobModel().findOne({}, {}, { sort: { jobId: -1 } })
    if (!result) return res.json({ data: { jobId: 1 } })
    return res.json({ data: { jobId: parseInt(result.jobId) + 1 } })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateJobStatus = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateStatusSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id, status } = req.body
    const result = await _JobModel().findOneAndUpdate({ _id, isDelete: false }, { $set: { status } }, { new: true })

    return res.json({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const deleteJobs = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, deleteSchema)
    if (validation.error) throw new Error(validation.error)

    const { id: _id } = req.body
    const result = await _JobModel().updateMany({ _id: { $in: _id } }, { $set: { isDelete: true } })
    return res.json({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

