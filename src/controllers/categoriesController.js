import dbConnection from '../database/pgsql.js';

async function getCategories(req, res) {
  try {
    // Obtain categories from Database
    const { rows: categories } = await dbConnection.query('SELECT * FROM categories');
    return res.status(200).send(categories);

    // Error when fetching categories from Database
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: 'An error occured when fetching categories from Database' });
  }
}

async function createCategory(req, res) {
  try {
    // Get category name from locals after middleware validation
    const { name } = res.locals.category;
    // Check Database for existing category with the same name
    const checkExistingCategory = await dbConnection.query(
      'SELECT * FROM categories WHERE name = $1',
      [name]
    );
    if (checkExistingCategory.rowCount > 0) {
      // Error: Existing category with the same name
      return res
        .status(409)
        .send({ message: `Error: Found an existing category with the name: ${name}` });
    }

    // Insert category into Database
    await dbConnection.query('INSERT INTO categories (name) VALUES ($1)', [name]);
    res.sendStatus(201);

    // Error when inserting category into Database
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ message: 'An error occured when inserting category into Database' });
  }
}

export { getCategories, createCategory };
