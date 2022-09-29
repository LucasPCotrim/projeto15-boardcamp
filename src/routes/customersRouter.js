import { Router } from 'express';
import { getCustomers, getCustomer } from '../controllers/customersController.js';

const customersRouter = Router();

customersRouter.get('/customers', getCustomers);
customersRouter.get('/customers/:id', getCustomer);

export default customersRouter;
