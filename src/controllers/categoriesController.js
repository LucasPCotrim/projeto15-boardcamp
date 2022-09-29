import dbConnection from '../database/pgsql.js';

async function getCategories(req, res) {
  try {
    const { rows: categories } = await dbConnection.query('SELECT * FROM categories');
    return res.status(200).send(categories);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: 'An error occured when fetching categories from Database' });
  }
}

export { getCategories };
