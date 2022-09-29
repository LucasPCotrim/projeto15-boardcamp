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
    const { row: customer, rowCount } = await dbConnection.query(
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

export { getCustomers, getCustomer };
