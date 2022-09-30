import dbConnection from '../database/pgsql.js';

async function getCustomers(req, res) {
  // Obtain optional query params
  const { cpf, limit, offset } = req.query;

  try {
    // Build query parameters and conditions
    const whereParams = [];
    let whereClause = '';
    if (cpf) {
      whereParams.push(`${cpf}%`);
      whereClause += `WHERE cpf LIKE $${whereParams.length}`;
    }
    const optionalParams = [];
    let optionalConditions = [];
    let optionalClause = '';
    if (limit) {
      optionalParams.push(limit);
      optionalConditions.push(`LIMIT $${whereParams.length + optionalParams.length}`);
    }
    if (offset) {
      optionalParams.push(offset);
      optionalConditions.push(`OFFSET $${whereParams.length + optionalParams.length}`);
    }
    if (optionalParams.length > 0) {
      optionalClause += `${optionalConditions.join(' ')}`;
    }
    const params = whereParams.concat(optionalParams);

    // Obtain customers from Database
    const { rows: customers } = await dbConnection.query(
      `SELECT * FROM customers
        ${whereClause}
        ORDER BY id ASC 
        ${optionalClause}`,
      params
    );
    res.status(200).send(customers);

    // Error when fetching customers from Database
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: 'An error occured when fetching customers from Database' });
  }
}

async function getCustomer(req, res) {
  // Obtain id from route parameters
  const { id } = req.params;

  try {
    // Obtain customer from Database (filter by id)
    const { rows: customer, rowCount } = await dbConnection.query(
      'SELECT * FROM customers WHERE id = $1',
      [id]
    );
    if (rowCount === 0) {
      // Customer not found
      return res.status(404).send({ message: 'Error: Customer not found' });
    }
    // Return customer
    res.status(200).send(customer[0]);

    // Error when fetching customer from Database
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: 'An error occured when fetching customer from Database' });
  }
}

async function createCustomer(req, res) {
  // Get customer from locals after middleware validation
  const { name, phone, cpf, birthday } = res.locals.customer;

  try {
    // Check existing customer with same cpf
    const checkExistingCustomer = await dbConnection.query(
      `SELECT * FROM customers
      WHERE cpf = $1`,
      [cpf]
    );
    if (checkExistingCustomer.rowCount > 0) {
      // Error: Existing customer found
      return res.status(409).send({ message: 'Error: Customer already in Database' });
    }
    // Insert custome into database
    await dbConnection.query(
      `INSERT INTO customers
      (name, phone, cpf, birthday)
      VALUES ($1, $2, $3, $4)`,
      [name, phone, cpf, birthday]
    );
    return res.sendStatus(201);

    // Error when inserting customer into Database
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: 'An error occured when inserting customer into Database' });
  }
}

async function updateCustomer(req, res) {
  // Get customer info from locals after middleware validation
  const { name, phone, cpf, birthday } = res.locals.customer;

  // Get customer id from route parameters
  const { id } = req.params;

  try {
    // Check if there's an existing customer with the same cpf
    const checkExistingCustomer = await dbConnection.query(
      `SELECT * FROM customers
      WHERE id <> $1 AND cpf = $2`,
      [id, cpf]
    );
    if (checkExistingCustomer.rowCount > 0) {
      return res.status(409).send({ message: 'Error: Invalid CPF' });
    }

    // Update customer in Database
    await dbConnection.query(
      `UPDATE customers
      SET name = $1, phone = $2, cpf = $3, birthday = $4
      WHERE id = $5`,
      [name, phone, cpf, birthday, id]
    );
    res.sendStatus(200);

    // Error when updating customer from Database
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'An error occured when fetching games from Database' });
  }
}

export { getCustomers, getCustomer, createCustomer, updateCustomer };
