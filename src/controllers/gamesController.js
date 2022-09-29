import dbConnection from '../database/pgsql.js';

async function getGames(req, res) {
  // Obtain optional query params
  const { name } = req.query;

  try {
    if (name) {
      // Obtain games from Database (filter by name)
      const { rows: games } = await dbConnection.query(
        `SELECT games.*, categories.name AS "categoryName"
        FROM games JOIN categories ON categories.id=games."categoryId"
        WHERE games.name ILIKE $1`,
        [`${name}%`]
      );
      res.status(200).send(games);
    } else {
      // Obtain games from Database
      const { rows: games } = await dbConnection.query(
        `SELECT games.*, categories.name AS "categoryName"
        FROM games JOIN categories ON categories.id=games."categoryId"`
      );
      res.status(200).send(games);
    }
    // Error when fetching games from Database
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: 'An error occured when fetching games from Database' });
  }
}

export { getGames };
