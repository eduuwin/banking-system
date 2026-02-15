import { query } from '../config/database.js';

export const GatewayLog = {
  async create(data) {
    const sql = `
      INSERT INTO gateway_logs (
        type, status, transaction_id, gateway_id, user_email,
        amount, request_data, response_data, error_message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.type,
      data.status,
      data.transaction_id || null,
      data.gateway_id || null,
      data.user_email || null,
      data.amount || null,
      data.request_data ? JSON.stringify(data.request_data) : null,
      data.response_data ? JSON.stringify(data.response_data) : null,
      data.error_message || null
    ];
    const result = await query(sql, values);
    return result.rows[0];
  },

  async findById(id) {
    const sql = 'SELECT * FROM gateway_logs WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  },

  async list({ limit = 50, offset = 0, type, status } = {}) {
    let sql = 'SELECT * FROM gateway_logs WHERE 1=1';
    const values = [];
    let index = 1;

    if (type) {
      sql += ` AND type = $${index}`;
      values.push(type);
      index++;
    }

    if (status) {
      sql += ` AND status = $${index}`;
      values.push(status);
      index++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${index} OFFSET $${index + 1}`;
    values.push(limit, offset);

    const result = await query(sql, values);
    return result.rows;
  },

  async count({ type, status } = {}) {
    let sql = 'SELECT COUNT(*) FROM gateway_logs WHERE 1=1';
    const values = [];
    let index = 1;

    if (type) {
      sql += ` AND type = $${index}`;
      values.push(type);
      index++;
    }

    if (status) {
      sql += ` AND status = $${index}`;
      values.push(status);
    }

    const result = await query(sql, values);
    return parseInt(result.rows[0].count);
  }
};

export default GatewayLog;
