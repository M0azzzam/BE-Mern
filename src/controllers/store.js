import _StoreModel from '../models/store'
import Joi from '@hapi/joi'

export const getAllStores = async (req, res) => {
  try {
    const { page, limit } = req.query
    const data = await _StoreModel().paginate({}, { page, limit })
    return res.json(data)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: true, reason: err.message })
  }
}

export const getCurrentStore = async (req, res) => {
  try {
    const { storeId } = req
    const data = await _StoreModel().findOne({ _id: storeId })
    return res.json({
      data
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateStoreInformation = async (req, res) => {
  try {
    const { id: _id, ...rest } = req.body
    const data = await _StoreModel().findOneAndUpdate({ _id }, rest, { new: true })

    return res.json({ data })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: true, reason: err.message })
  }
}

export const getStoreById = async (req, res) => {
  try {
    const { id: _id } = req.query
    const data = await _StoreModel().findOne({ _id })

    return res.json({ data })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: true, reason: err.message })
  }
}

export const addNewStore = async (req, res) => {
  try {
    const data = await _StoreModel().create({ ...req.body, isDefault: false })
    return res.json({ data })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: true, reason: err.message })
  }
}
