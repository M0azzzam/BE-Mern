import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '../config/app'
import _UserModel from '../models/user'
import _BusinessModel from '../models/business'
import _StoreModel from '../models/store'
import _VerificationToken from '../models/verificationToken'
import sgMail from '@sendgrid/mail'
import { generateRandomKey } from '../utils/helpers'
import Joi from '@hapi/joi'
import { flatten } from 'flat'
import ERRORS from '../constants/errors'
sgMail.setApiKey(config.sendGridApiKey);

const setupDefaultStore = async (data) => {
  const { name, business, email, user } = data
  const result = await _StoreModel().create({
    name,
    business,
    email,
    user,
    tenantId: business
  })

  await _UserModel().findOneAndUpdate({ _id: user }, { defaultStore: result._id })

  return result;
}

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

const registerSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
  businessName: Joi.string().min(1).required(),
  contact: Joi.object()
})

const updateSchema = Joi.object({
  name: Joi.string().min(1),
  email: Joi.string().email(),
  password: Joi.string().min(3),
  businessName: Joi.string().min(1),
  contact: Joi.object({
    mobile: Joi.string(),
    phone: Joi.string(),
    address: Joi.string(),
    city: Joi.string(),
    zip: Joi.string(),
    country: Joi.string()
  })
})

const verifyTokenSchema = Joi.object({
  token: Joi.string().min(1).required()
})

export const loginController = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, loginSchema)
    if (validation.error) throw new Error(validation.error)

    const { email, password } = req.body
    const user = await _UserModel().findOne({ email }).select('+password').populate('role')
    if (!user) throw new Error(ERRORS.WRONG_CREDENTIALS)
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.log(err)
        return res.status(401).json({ error: true, reason: err.toString() })
      }
      const userdoc = { ...user._doc }
      delete userdoc.password;
      if (isMatch) {
        const token = jwt.sign({ userId: user._id, storeId: user.defaultStore }, config.authKey)
        return res.status(200).json({
          ...userdoc,
          token
        })
      } else {
        return res.status(401).json({ error: true, reason: ERRORS.WRONG_CREDENTIALS })
      }
    })
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: true, reason: err.message })
  }
}

export const registerController = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, registerSchema)
    if (validation.error) throw new Error(validation.error)

    const { name, email, password, businessName, contact = {} } = req.body

    const alreadyExistingUser = await _UserModel().findOne({ email })
    if (alreadyExistingUser) {
      throw new Error(ERRORS.EMAIL_ALREADY_EXISTS)
    }

    const business = await _BusinessModel().create({
      name: businessName,
      email
    })

    const user = await _UserModel().create({
      name,
      email,
      password,
      business: business._id,
      contact
    })

    business.user = user._id
    await business.save()

    const hashForVerification = generateRandomKey(20)
    await _VerificationToken().create({
      token: hashForVerification,
      user: user._id
    })

    const msg = {
      to: email,
      from: 'no-reply@repairdesk.co',
      subject: 'Verify your account on Repair Desk',
      html: `
        <h4>We warmly welcome you on Repair Desk!</h4>
        Please verify your account by clicking on the link <a target='_blank' href='http://${req.get('host')}/api/users/verify/${hashForVerification}'>CLICK HERE</a>
        <hr />
        <p>If you haven't created this account, you can simply ignore this email.</p>
        <p>Regards,</p>
        <p>Account Manager</p>
        <p>Repair Desk Inc.</p>
      `,
    };

    console.log('VERIFICATION ==== ', `${req.get('host')}/api/users/verify/${hashForVerification}`)

    sgMail.send(msg)

    const token = jwt.sign({ userId: user._id }, config.authKey);

    return res.status(200).json({ data: { ...user._doc, token } })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ error: true, reason: err.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const validation = Joi.validate(req.body, updateSchema)
    if (validation.error) throw new Error(validation.error)

    const { name, email, password, contact } = req.body
    let $set = {}
    if (name) $set.name = name
    if (email) $set.email = email
    if (password) $set.password = password
    if (Object.keys(contact).length) {
      $set = { ...$set, ...flatten({ contact }) }
    }
    const result = await _UserModel().findByIdAndUpdate(req.user._id, $set)
    return res.json({ data: result })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const verifyAccount = async (req, res) => {
  try {
    const validation = Joi.validate(req.params, verifyTokenSchema)
    if (validation.error) throw new Error(validation.error)

    const { token } = req.params
    const foundToken = await _VerificationToken().findOne({ token })
    if (!foundToken) throw new Error(ERRORS.TOKEN_EXPIRED)
    const user = await _UserModel().findOne({ _id: foundToken.user }).populate('business')
    user.isEmailVerified = true
    await Promise.all([user.save(), foundToken.remove()])
    await setupDefaultStore({ user: user._id, business: user.business._id, name: user.business.name, email: user.email, isDefault: true })
    return res.status(200).json({ data: user })
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: true, reason: err.message })
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const business = req.user.business
    const _id = req.user._id
    const user = await _UserModel().findOne({ business, _id }).populate('role')

    return res.status(200).json({ data: { ...user._doc } })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateUserProfile = async (req, res) => {
  try {
    const business = req.user.business
    const _id = req.user._id

    const user = await _UserModel().findOneAndUpdate({ business, _id }, req.body, { new: true })

    return res.status(200).json({ data: { ...user._doc } })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}

export const updateUserPassword = async (req, res) => {
  try {
    const business = req.user.business
    const _id = req.user._id

    const { oldPassword, newPassword } = req.body

    const user = await _UserModel().findOne({ business, _id }).select('+password')
    bcrypt.compare(oldPassword, user.password, async (err, isMatch) => {
      if (err) {
        console.log(err)
        return res.status(400).json({ error: true, reason: ERRORS.INVALID_PASSWORD })
      }

      if (isMatch) {
        user.password = newPassword
        await user.save()
        return res.json({ data: {} })
      } else {
        return res.status(400).json({ error: true, reason: ERRORS.INVALID_PASSWORD })
      }
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ error: true, reason: err.message })
  }
}
