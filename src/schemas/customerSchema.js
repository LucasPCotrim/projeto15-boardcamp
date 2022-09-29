import joi from 'joi';

const customerSchema = joi.object({
  name: joi.string().required(),
  phone: joi
    .string()
    .min(10)
    .max(11)
    .pattern(/^[0-9]+$/)
    .required(),
  cpf: joi
    .string()
    .length(11)
    .pattern(/^[0-9]+$/),
  birthday: joi.date().format('YYYY-MM-DD').raw().required(),
});

export default customerSchema;
