import { query } from '../config/database.js';

export const User = {
  async create({ email, password_hash, full_name, cpf, phone }) {
    const sql = `
      INSERT INTO users (email, password_hash, full_name, cpf, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, cpf, phone, balance, kyc_status, is_admin, is_active, created_at
    `;
    const result = await query(sql, [email, password_hash, full_name, cpf, phone]);
    return result.rows[0];
  },

  async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0];
  },

  async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  },

  async findByCPF(cpf) {
    const sql = 'SELECT * FROM users WHERE cpf = $1';
    const result = await query(sql, [cpf]);
    return result.rows[0];
  },

  async update(email, data) {
    const fields = [];
    const values = [];
    let index = 1;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${index}`);
        values.push(data[key]);
        index++;
      }
    });

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(email);

    const sql = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE email = $${index}
      RETURNING id, email, full_name, cpf, phone, balance, kyc_status, is_admin, is_active, created_at, updated_at
    `;

    const result = await query(sql, values);
    return result.rows[0];
  },

  async updateBalance(email, amount) {
    const sql = `
      UPDATE users
      SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP
      WHERE email = $2
      RETURNING balance
    `;
    const result = await query(sql, [amount, email]);
    return result.rows[0];
  },

  async getBalance(email) {
    const sql = 'SELECT balance FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0]?.balance || 0;
  },

  async list({ limit = 50, offset = 0, kyc_status, is_active } = {}) {
    let sql = 'SELECT id, email, full_name, cpf, phone, balance, kyc_status, is_admin, is_active, created_at FROM users WHERE 1=1';
    const values = [];
    let index = 1;

    if (kyc_status) {
      sql += ` AND kyc_status = $${index}`;
      values.push(kyc_status);
      index++;
    }

    if (is_active !== undefined) {
      sql += ` AND is_active = $${index}`;
      values.push(is_active);
      index++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${index} OFFSET $${index + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  },

  async count({ kyc_status, is_active } = {}) {
    let sql = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const values = [];
    let index = 1;

    if (kyc_status) {
      sql += ` AND kyc_status = $${index}`;
      values.push(kyc_status);
      index++;
    }

    if (is_active !== undefined) {
      sql += ` AND is_active = $${index}`;
      values.push(is_active);
    }

    const result = await query(sql, values);
    return parseInt(result.rows[0].count);
  }
};

export default User;
