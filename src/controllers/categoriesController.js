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

async function createCategory(req, res) {
  try {
    const { name } = res.locals.category;
    const checkExistingCategory = await dbConnection.query(
      'SELECT * FROM categories WHERE name = $1',
      [name]
    );
    if (checkExistingCategory.rowCount > 0) {
      return res
        .status(409)
        .send({ message: `Error: Found an existing category with the name: ${name}` });
    }

    await dbConnection.query('INSERT INTO categories (name) VALUES ($1)', [name]);
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: 'An error occured when inserting category into Database' });
  }
}

export { getCategories, createCategory };
