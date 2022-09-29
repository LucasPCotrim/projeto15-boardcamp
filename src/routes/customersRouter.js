import { Router } from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
} from '../controllers/customersController.js';
import validateCustomer from '../middlewares/cutomersMiddleware.js';

const customersRouter = Router();

customersRouter.get('/customers', getCustomers);
customersRouter.get('/customers/:id', getCustomer);
customersRouter.post('/customers', validateCustomer, createCustomer);
customersRouter.put('/customers/:id', validateCustomer, updateCustomer);

export default customersRouter;
