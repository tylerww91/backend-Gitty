// const pool = require('../utils/pool');

// module.exports = class GithubUser {
//   id;
//   login;
//   email;
//   avatar;

//   constructor(row) {
//     this.id = row.id;
//     this.login = row.login;
//     this.email = row.email;
//     this.avatar = row.avatar;
//   }

//   static async findByLogin(login) {
//     const { rows } = await pool.query(
//       `
//             SELECT *
//             FROM github_users
//             WHERE login = $1
//         `,
//       [login]
//     );

//     if (!rows[0]) return null;

//     return new GithubUser();
//   }
// };
