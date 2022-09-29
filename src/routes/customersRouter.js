import { Router } from 'express';
import { getCustomers, getCustomer, createCustomer } from '../controllers/customersController.js';
import validateCustomer from '../middlewares/cutomersMiddleware.js';

const customersRouter = Router();

customersRouter.get('/customers', getCustomers);
customersRouter.get('/customers/:id', getCustomer);
customersRouter.post('/customers', validateCustomer, createCustomer);

export default customersRouter;
