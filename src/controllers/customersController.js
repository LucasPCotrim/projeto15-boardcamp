import dbConnection from '../database/pgsql.js';

async function getCustomers(req, res) {
  // Obtain optional query params
  const { cpf } = req.query;

  try {
    if (cpf) {
      // Obtain customers from Database (filter by cpf)
      const { rows: customers } = await dbConnection.query(
        `SELECT * FROM customers
        WHERE cpf LIKE $1;`,
        [`${cpf}%`]
      );
      res.status(200).send(customers);
    } else {
      // Obtain customers from Database
      const { rows: customers } = await dbConnection.query(`SELECT * FROM customers`);
      res.status(200).send(customers);
    }

    // Error when fetching customers from Database
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'An error occured when fetching games from Database' });
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
    return res.status(500).send({ message: 'An error occured when fetching games from Database' });
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
    return res.status(500).send({ message: 'An error occured when fetching games from Database' });
  }
}

export { getCustomers, getCustomer, createCustomer };
