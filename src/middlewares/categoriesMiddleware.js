import categorySchema from '../schemas/categorySchema.js';

export default function validateCategory(req, res, next) {
  const { name } = req.body;
  const { error: validError } = categorySchema.validate({ name });
  if (validError) {
    return res.status(400).send({ message: String(validError) });
  }
  res.locals.category = { name };
  next();
}
