import dbConnection from '../database/pgsql.js';

async function getGames(req, res) {
  // Obtain optional query params
  const { name, limit, offset } = req.query;

  try {
    // Build query parameters and conditions
    const whereParams = [];
    let whereClause = '';
    if (name) {
      whereParams.push(`${name}%`);
      whereClause += `WHERE games.name ILIKE $${whereParams.length}`;
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

    // Obtain games from Database
    const { rows: games } = await dbConnection.query(
      `SELECT games.*, categories.name AS "categoryName"
      FROM games JOIN categories
      ON categories.id=games."categoryId"
      ${whereClause}
      ORDER BY id ASC 
      ${optionalClause}`,
      params
    );
    res.status(200).send(games);

    // Error when fetching games from Database
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'An error occured when fetching games from Database' });
  }
}

async function createGame(req, res) {
  // Get game from locals after middleware validation
  const { name, image, stockTotal, categoryId, pricePerDay } = res.locals.game;

  try {
    // Check if game's categoryId corresponds to existing category in Database
    const checkCategory = await dbConnection.query('SELECT * FROM categories WHERE id = $1;', [
      categoryId,
    ]);
    if (checkCategory.rowCount === 0) {
      return res.status(400).send({ message: `Error: Game's category is not in the Database` });
    }

    // Check if game's name corresponds to existing game name in Database
    const checkName = await dbConnection.query('SELECT * FROM games WHERE name = $1;', [name]);
    if (checkName.rowCount > 0) {
      return res.status(409).send({ message: `Error: Found existing game with name: ${name}` });
    }

    // Insert game into Database
    await dbConnection.query(
      `INSERT INTO games
    (name, image, "stockTotal", "categoryId", "pricePerDay")
    VALUES ($1, $2, $3, $4, $5);`,
      [name, image, Number(stockTotal), categoryId, Number(pricePerDay)]
    );
    res.sendStatus(201);

    // Error when inserting game into Database
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'An error occured when inserting game into Database' });
  }
}

export { getGames, createGame };
