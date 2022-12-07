const pool = require('../utils/pool');

module.exports = class Post {
  id;
  user_id;
  title;
  description;

  constructor(row) {
    this.id = row.id;
    this.user_id = row.user_id;
    this.title = row.title;
    this.description = row.description;
  }

  static async getAll() {
    const { rows } = await pool.query(
      `
      SELECT * from posts
      `
    );
    return rows.map((row) => new Post(row));
  }

  static async insert({ title, description, user_id }) {
    const { rows } = await pool.query(
      `
        INSERT INTO posts (title, description, user_id)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
      [title, description, user_id]
    );

    return new Post(rows[0]);
  }
};
