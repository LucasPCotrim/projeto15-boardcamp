import dbConnection from '../database/pgsql.js';

async function getRentals(req, res) {
  const { customerId, gameId } = req.query;

  try {
    // Build query parameters and conditions
    const params = [];
    const conditions = [];
    let whereClause = '';
    if (customerId) {
      params.push(customerId);
      conditions.push(`rentals."customerId" = $${params.length}`);
    }
    if (gameId) {
      params.push(gameId);
      conditions.push(`rentals."gameId" = $${params.length}`);
    }
    if (params.length > 0) {
      whereClause += `WHERE ${conditions.join(' AND ')}`;
    }

    // Obtain rentals from Database
    const { rows: rentals } = await dbConnection.query(
      `SELECT
        rentals.*,
        json_build_object('id', customers.id, 'name', customers.name) AS customer,
        json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game,
      FROM rentals
        JOIN customers ON customers.id = rentals."customerId"
        JOIN games ON games.id = rentals."gameId"
        JOIN categories ON categories.id = games."categoryId"
      ${whereClause}
      `,
      params
    );
    res.status(200).send(rentals);

    // Error when fetching rentals from Database
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: 'An error occured when fetching rentals from Database' });
  }
}

async function createRental(req, res) {}

export { getRentals, createRental };
