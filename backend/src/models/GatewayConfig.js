import { query } from '../config/database.js';

export const GatewayConfig = {
  async get() {
    const sql = 'SELECT * FROM gateway_config WHERE is_active = true LIMIT 1';
    const result = await query(sql);
    return result.rows[0];
  },

  async getById(id) {
    const sql = 'SELECT * FROM gateway_config WHERE id = $1';
    const result = await query(sql, [id]);
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
      UPDATE gateway_config
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  },

  async list() {
    const sql = 'SELECT * FROM gateway_config ORDER BY created_at DESC';
    const result = await query(sql);
    return result.rows;
  }
};

export default GatewayConfig;
