import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import './aws'
// import './redis'

import configureRoutes from './routes'
import { bindCurrentNamespace, setCurrentTenantId } from './lib/storage'
import './models'
import { pagination } from './middlewares/pagination';

mongoose.Promise = global.Promise
const app = express()
const PORT = process.env.PORT || 3000

app.use(bindCurrentNamespace)
app.use(cors())
app.use(helmet())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(pagination({ page: 1, limit: 25, maxLimit: 100 }))
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

configureRoutes(app)

if (!process.env.MONGO_URI) {
  console.error('ENV=MONGO_URI is not set')
  process.exit(0)
}

mongoose.connect(process.env.MONGO_URI, { useCreateIndex: false, useNewUrlParser: true, autoReconnect: true, useFindAndModify: false })
if (process.env.NODE_ENV === 'development') mongoose.set('debug', true)

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
