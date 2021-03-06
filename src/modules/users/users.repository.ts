import { User, UserWithoutId } from './interfaces/user';
import { UserParameters } from './interfaces/parameters';
import { userDocToUser } from '../../mappers/user.mapper';
import { connection } from '../../main';

class UserRepository {
  async findByEmail(email: User['email']): Promise<User> {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM users WHERE email = ?`, [email], function (error, results) {
        if (error) {
          console.log(error);
          return reject(error);
        } else if (results[0] === undefined) {
          return resolve(null);
        } else {
          return resolve(userDocToUser(results[0]));
        }
      });
    });
  }

  async findById(id: User['id']): Promise<User | null> {
    return new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM users WHERE user_id = ?`, [id], function (error, results) {
        if (error) {
          console.log(error);
          return reject(error);
        } else if (results[0] === undefined) {
          return resolve(null);
        } else {
          return resolve(userDocToUser(results[0]));
        }
      });
    });
  }

  async update(id, user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      connection.query(
        `UPDATE users
        SET first_name = ?,
        last_name = ?,
        age = ?,
        email = ?,
        phone_number = ?,
        user_role = ?,
        user_password = ?
        WHERE user_id = ?`,
        [user.name, user.surname, user.age, user.email, user.tel, user.role, user.password, id],
        (error) => {
          if (error) {
            console.log(error);
            return reject(error);
          } else {
            return resolve(this.findByEmail(user.email));
          }
        }
      );
    });
  }

  delete(id: User['id']): Promise<void> {
    return new Promise((resolve, reject) => {
      connection.query(`DELETE FROM users WHERE user_id = ?`, [id], function (error, results, fields) {
        if (error) {
          console.log(error);
          return reject(error);
        } else {
          return resolve();
        }
      });
    });
  }

  async create(user: UserWithoutId): Promise<User> {
    return new Promise((resolve, reject) => {
      connection.query(
        `INSERT INTO users (first_name, last_name, age, email, phone_number, user_role, user_password)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user.name, user.surname, user.age, user.email, user.tel, user.role, user.password],
        (error) => {
          if (error) {
            console.log(error);
            return reject(error);
          } else {
            return resolve(this.findByEmail(user.email));
          }
        }
      );
    });
  }

  async findAndSort(parameters: UserParameters): Promise<User[]> {
    return new Promise((resolve, reject) => {
      let query = 'SELECT * FROM users';
      if (parameters.filter) {
        query = Object.entries(parameters.filter).reduce((acc, [k, v], index) => {
          if (index === 0) {
            acc += ` WHERE ${k} = '${v}'`;
          } else {
            acc += ` AND ${k} = '${v}'`;
          }
          return acc;
        }, query);
      }
      if (parameters.sortBy && parameters.direction) {
        query += ` ORDER BY ${parameters.sortBy} ${parameters.direction}`;
      }
      if (parameters.limit) {
        query += ` LIMIT ${parameters.limit}`;
      }
      if (parameters.skip) {
        query += ` OFFSET ${parameters.skip}`;
      }
      connection.query(query, function (error, results) {
        if (error) {
          console.log(error);
          return reject(error);
        } else {
          return resolve(results.map(userDocToUser));
        }
      });
    });
  }
}

const userRepository = new UserRepository();
export { userRepository };
