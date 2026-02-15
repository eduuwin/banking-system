import { query } from '../config/database.js';

export const Transaction = {
  async create(data) {
    const sql = `
      INSERT INTO transactions (
        user_email, type, amount, fee, net_amount, status,
        pix_key, pix_key_type, recipient_name, description,
        gateway_transaction_id, qr_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const values = [
      data.user_email,
      data.type,
      data.amount,
      data.fee || 0,
      data.net_amount,
      data.status || 'pending',
      data.pix_key || null,
      data.pix_key_type || null,
      data.recipient_name || null,
      data.description || null,
      data.gateway_transaction_id || null,
      data.qr_code || null
    ];
    const result = await query(sql, values);
    return result.rows[0];
  },

  async findById(id) {
    const sql = 'SELECT * FROM transactions WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  },

  async findByGatewayId(gateway_transaction_id) {
    const sql = 'SELECT * FROM transactions WHERE gateway_transaction_id = $1';
    const result = await query(sql, [gateway_transaction_id]);
    return result.rows[0];
  },

  async update(id, data) {
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
    values.push(id);

    const sql = `
      UPDATE transactions
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  },

  async listByUser(user_email, { limit = 50, offset = 0, type, status } = {}) {
    let sql = 'SELECT * FROM transactions WHERE user_email = $1';
    const values = [user_email];
    let index = 2;

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

  async list({ limit = 50, offset = 0, type, status, user_email } = {}) {
    let sql = 'SELECT * FROM transactions WHERE 1=1';
    const values = [];
    let index = 1;

    if (user_email) {
      sql += ` AND user_email = $${index}`;
      values.push(user_email);
      index++;
    }

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

  async count({ type, status, user_email } = {}) {
    let sql = 'SELECT COUNT(*) FROM transactions WHERE 1=1';
    const values = [];
    let index = 1;

    if (user_email) {
      sql += ` AND user_email = $${index}`;
      values.push(user_email);
      index++;
    }

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
  },

  async getStats() {
    const sql = `
      SELECT
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'completed' THEN net_amount ELSE 0 END) as total_volume,
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN net_amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN net_amount ELSE 0 END) as total_withdrawals
      FROM transactions
    `;
    const result = await query(sql);
    return result.rows[0];
  }
};

export default Transaction;
