import { Router } from 'express';
import {
  getRentals,
  createRental,
  concludeRental,
  deleteRental,
} from '../controllers/rentalsController.js';
import validateRental from '../middlewares/rentalsMiddleware.js';

const rentalsRouter = Router();

rentalsRouter.get('/rentals', getRentals);
rentalsRouter.post('/rentals', validateRental, createRental);
rentalsRouter.post('/rentals/:id/return', concludeRental);
rentalsRouter.delete('/rentals/:id', deleteRental);

export default rentalsRouter;
