import dbConnection from '../database/pgsql.js';

async function getCustomers(req, res) {
  // Obtain optional query params
  const { cpf } = req.query;

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

  try {
    // Error when fetching customers from Database
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'An error occured when fetching games from Database' });
  }
}

export { getCustomers };
