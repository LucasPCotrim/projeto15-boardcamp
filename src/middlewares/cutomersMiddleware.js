import customerSchema from '../schemas/customerSchema.js';

export default function validateCustomer(req, res, next) {
  // Obtain customer from body
  const { name, phone, cpf, birthday } = req.body;
  // Validate customer
  const { error: validError } = customerSchema.validate({
    name,
    phone,
    cpf,
    birthday,
  });
  if (validError) {
    return res.status(400).send({ message: String(validError) });
  }
  // Store customer in res.locals
  res.locals.customer = { name, phone, cpf, birthday };
  next();
}
