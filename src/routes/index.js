import userRoutes from './users'
import roleRoutes from './roles'
import employeeRoutes from './employees'
import storeRoutes from './stores'
import colorRoutes from './colors'
import manufacturerRoutes from './manufacturer'
import deviceRoutes from './devices'
import productCategoriesRoutes from './productCategories'
import repairCategoriesRoutes from './repairCategories'
import vendorRoutes from './vendor'
import physicalLocationsRoutes from './physicalLocations'
import storageRoutes from './storage'
import inventoryRoutes from './inventory'
import clientsRoutes from './clients'
import taxesRoutes from './taxes'
import estimatesRoutes from './estimates'
import invoicesRoutes from './invoices'
import jobsRoutes from './job'
import { authenticate, authorize } from '../middlewares/auth'

const configureRoutes = app => {
  app.use('/users', userRoutes)
  app.use('/roles', authenticate, authorize(), roleRoutes)
  app.use('/employees', authenticate, authorize(), employeeRoutes)
  app.use('/stores', authenticate, authorize(), storeRoutes)
  app.use('/manufacturers', authenticate, authorize(), manufacturerRoutes)
  app.use('/colors', authenticate, authorize(), colorRoutes)
  app.use('/devices', authenticate, authorize(), deviceRoutes)
  app.use('/product_categories', authenticate, authorize(), productCategoriesRoutes)
  app.use('/repair_categories', authenticate, authorize(), repairCategoriesRoutes)
  app.use('/vendors', authenticate, authorize(), vendorRoutes)
  app.use('/physical_locations', authenticate, authorize(), physicalLocationsRoutes)
  app.use('/storage', authenticate, storageRoutes)
  app.use('/inventories', authenticate, authorize(), inventoryRoutes)
  app.use('/clients', authenticate, authorize(), clientsRoutes)
  app.use('/taxes', authenticate, authorize(), taxesRoutes)
  app.use('/estimates', authenticate, authorize(), estimatesRoutes)
  app.use('/invoices', authenticate, authorize(), invoicesRoutes)
  app.use('/jobs', authenticate, authorize(), jobsRoutes)

  app.use('*', (req, res, next) => {
    return res.status(404).json({ error: true, reason: 'ROUTE_NOT_FOUND' })
  })
}

export default configureRoutes
