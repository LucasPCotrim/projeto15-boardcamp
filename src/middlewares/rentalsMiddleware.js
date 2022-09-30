import rentalSchema from '../schemas/rentalSchema.js';

export default function validateRental(req, res, next) {
  // Obtain rental from body
  const { customerId, gameId, daysRented } = req.body;
  // Validate rental
  const { error: validError } = rentalSchema.validate({
    customerId,
    gameId,
    daysRented,
  });
  if (validError) {
    return res.status(400).send({ message: String(validError) });
  }
  // Store rental in res.locals
  res.locals.rental = { customerId, gameId, daysRented };
  next();
}
