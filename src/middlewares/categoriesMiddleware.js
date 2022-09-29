import categorySchema from '../schemas/categorySchema.js';

export default function validateCategory(req, res, next) {
  // Obtain category name from body
  const { name } = req.body;
  // Validate category
  const { error: validError } = categorySchema.validate({ name });
  if (validError) {
    return res.status(400).send({ message: String(validError) });
  }
  // Store category in res.locals
  res.locals.category = { name };
  next();
}
