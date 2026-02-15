import { query } from '../config/database.js';

export const KYCDocument = {
  async create(data) {
    const sql = `
      INSERT INTO kyc_documents (
        user_email, document_type, document_front_url, document_back_url,
        selfie_url, full_name, cpf, birth_date, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      data.user_email,
      data.document_type,
      data.document_front_url,
      data.document_back_url,
      data.selfie_url,
      data.full_name,
      data.cpf,
      data.birth_date,
      data.status || 'pending'
    ];
    const result = await query(sql, values);
    return result.rows[0];
  },

  async findById(id) {
    const sql = 'SELECT * FROM kyc_documents WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  },

  async findByUserEmail(user_email) {
    const sql = 'SELECT * FROM kyc_documents WHERE user_email = $1 ORDER BY created_at DESC LIMIT 1';
    const result = await query(sql, [user_email]);
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
      UPDATE kyc_documents
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  },

  async approve(id, reviewed_by) {
    const sql = `
      UPDATE kyc_documents
      SET status = 'approved',
          reviewed_by = $2,
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, reviewed_by]);
    return result.rows[0];
  },

  async reject(id, reviewed_by, rejection_reason) {
    const sql = `
      UPDATE kyc_documents
      SET status = 'rejected',
          reviewed_by = $2,
          rejection_reason = $3,
          reviewed_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, reviewed_by, rejection_reason]);
    return result.rows[0];
  },

  async list({ limit = 50, offset = 0, status } = {}) {
    let sql = 'SELECT * FROM kyc_documents WHERE 1=1';
    const values = [];
    let index = 1;

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

  async count({ status } = {}) {
    let sql = 'SELECT COUNT(*) FROM kyc_documents WHERE 1=1';
    const values = [];

    if (status) {
      sql += ' AND status = $1';
      values.push(status);
    }

    const result = await query(sql, values);
    return parseInt(result.rows[0].count);
  }
};

export default KYCDocument;
