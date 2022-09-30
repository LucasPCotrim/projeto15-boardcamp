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
        json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game
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

async function createRental(req, res) {
  // Get rental info from locals after middleware validation
  const { customerId, gameId, daysRented } = res.locals.rental;

  try {
    // Check if customerId is valid
    const checkCustomer = await dbConnection.query(
      `SELECT id FROM customers 
      WHERE id = $1`,
      [customerId]
    );
    if (checkCustomer.rowCount === 0) {
      return res.status(400).send({ message: 'Error: Invalid customerId' });
    }

    // Check if gameId is valid
    const checkGame = await dbConnection.query(
      `SELECT * FROM games 
      WHERE id = $1`,
      [gameId]
    );
    if (checkGame.rowCount === 0) {
      return res.status(400).send({ message: 'Error: Invalid gameId' });
    }
    const game = checkGame.rows[0];

    // Check if gameId is available
    const checkRentals = await dbConnection.query(
      `SELECT id
      FROM rentals 
      WHERE "gameId" = $1 AND "returnDate" IS null`,
      [gameId]
    );
    if (checkRentals.rowCount > 0 && game.stockTotal === checkRentals.rowCount) {
      return res.status(400).send({ message: 'Error: Game not available' });
    }

    // Insert rental into Database
    const originalPrice = daysRented * game.pricePerDay;
    await dbConnection.query(
      `INSERT INTO rentals
      ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
      VALUES ($1, $2, NOW(), $3, null, $4, null)`,
      [customerId, gameId, daysRented, originalPrice]
    );
    res.sendStatus(201);

    // Error when inserting rental into Database
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: 'An error occured when inserting rental into Database' });
  }
}

export { getRentals, createRental };
