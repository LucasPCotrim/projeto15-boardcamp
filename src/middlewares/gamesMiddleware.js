import gameSchema from '../schemas/gameSchema.js';

export default function validateGame(req, res, next) {
  // Obtain game from body
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
  // Validate game
  const { error: validError } = gameSchema.validate({
    name,
    image,
    stockTotal,
    categoryId,
    pricePerDay,
  });
  if (validError) {
    return res.status(400).send({ message: String(validError) });
  }
  // Store game in res.locals
  res.locals.game = { name, image, stockTotal, categoryId, pricePerDay };
  next();
}
