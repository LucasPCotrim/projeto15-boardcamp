import dbConnection from '../database/pgsql.js';
const timesInMilliseconds = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 3600 * 1000,
  DAY: 24 * 3600 * 1000,
};

async function getRentals(req, res) {
  // Obtain optional query params
  const { customerId, gameId, limit, offset } = req.query;

  try {
    // Build query parameters and conditions
    const whereParams = [];
    const whereConditions = [];
    let whereClause = '';
    if (customerId) {
      whereParams.push(customerId);
      whereConditions.push(`rentals."customerId" = $${whereParams.length}`);
    }
    if (gameId) {
      whereParams.push(gameId);
      whereConditions.push(`rentals."gameId" = $${whereParams.length}`);
    }
    if (whereParams.length > 0) {
      whereClause += `WHERE ${whereConditions.join(' AND ')}`;
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
      ORDER BY id ASC 
      ${optionalClause}
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

async function concludeRental(req, res) {
  // Obtain rental id from route parameters
  const { id } = req.params;

  try {
    // Check if rental is in the Database
    const checkRental = await dbConnection.query(
      `SELECT * FROM rentals
      WHERE id = $1`,
      [id]
    );
    if (checkRental.rowCount === 0) {
      return res.status(404).send({ message: 'Error: Rental not found' });
    }
    const rental = checkRental.rows[0];
    // Check if rental is already concluded
    if (rental.returnDate) {
      return res.status(400).send({ message: 'Error: Invalid rental id' });
    }
    // Calculate delayFee
    const daysSinceRent = Math.floor(
      (new Date().getTime() - new Date(rental.rentDate).getTime()) / timesInMilliseconds.DAY
    );
    let delayFee = 0;
    if (daysSinceRent > rental.daysRented) {
      delayFee = (daysSinceRent - rental.daysRented) * rental.originalPrice;
    }

    // Update rental
    await dbConnection.query(
      `UPDATE rentals
      SET "returnDate" = NOW(), "delayFee" = $1
      WHERE id = $2`,
      [delayFee, id]
    );
    res.sendStatus(200);

    // Error when updating rental from Database
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: 'An error occured when inserting rental into Database' });
  }
}

async function deleteRental(req, res) {
  // Obtain rental id from route parameters
  const { id } = req.params;

  try {
    // Check if rental is in the Database
    const checkRental = await dbConnection.query(
      `SELECT * FROM rentals
      WHERE id = $1`,
      [id]
    );
    if (checkRental.rowCount === 0) {
      return res.status(404).send({ message: 'Error: Rental not found' });
    }
    const rental = checkRental.rows[0];
    // Check if rental has already been concluded
    if (!rental.returnDate) {
      return res.status(400).send({ message: 'Error: Cannot delete unfinished rental' });
    }
    // Delete rental from Database
    await dbConnection.query(`DELETE FROM rentals WHERE id = $1`, [id]);
    res.sendStatus(200);

    // Error when deleting rental from Database
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: 'An error occured when inserting rental into Database' });
  }
}

export { getRentals, createRental, concludeRental, deleteRental };
