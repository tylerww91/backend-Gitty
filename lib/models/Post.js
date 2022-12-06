const pool = require('../utils/pool');

module.exports = class Post {
  id;
  user_id;
  title;
  description;
  created_at;

  constructor(row) {
    this.id = row.id;
    this.user_id = row.user_id;
    this.title = row.title;
    this.description = row.description;
    this.created_at = row.created_at;
  }

  // static async getAll(user_id) {
  //   const { rows } = await pool.query(
  //     `
  //     SELECT * from posts
  //     where user_id = $1
  //     ORDER BY created_at DESC
  //     `,
  //     [user_id]
  //   );
  //   return new Post(rows[0]);
  // }

  static async insert({ title, description, user_id }) {
    console.log('insert params', title, description);
    const { rows } = await pool.query(
      `
        INSERT INTO posts (title, description, user_id)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
      [title, description, user_id]
    );

    console.log('row 0', rows[0]);
    return new Post(rows[0]);
  }
};
