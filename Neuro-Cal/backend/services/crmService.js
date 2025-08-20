import { pool } from '../server.js';

class CRMService {
  
  // ===== CONTACT MANAGEMENT =====
  
  // Create a new contact
  static async createContact(userId, contactData) {
    const client = await pool.connect();
    
    try {
      const {
        first_name, last_name, email, phone, mobile, job_title,
        department, company_id, address, birthday, notes, tags,
        lead_score, status, source
      } = contactData;
      
      const result = await client.query(`
        INSERT INTO contacts (
          user_id, company_id, first_name, last_name, email, phone, mobile,
          job_title, department, address, birthday, notes, tags,
          lead_score, status, source
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `, [
        userId, company_id, first_name, last_name, email, phone, mobile,
        job_title, department, address, birthday, notes, tags,
        lead_score || 0, status || 'active', source
      ]);
      
      const contact = result.rows[0];
      
      // Log activity
      await this.logActivity(client, userId, 'note', 'Contact Created', 
        `Created contact: ${first_name} ${last_name}`, 'contact', contact.id);
      
      return contact;
      
    } finally {
      client.release();
    }
  }
  
  // Get all contacts for a user
  static async getContacts(userId, filters = {}) {
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT c.*, comp.name as company_name
        FROM contacts c
        LEFT JOIN companies comp ON c.company_id = comp.id
        WHERE c.user_id = $1
      `;
      
      const params = [userId];
      let paramCount = 1;
      
      if (filters.status) {
        paramCount++;
        query += ` AND c.status = $${paramCount}`;
        params.push(filters.status);
      }
      
      if (filters.company_id) {
        paramCount++;
        query += ` AND c.company_id = $${paramCount}`;
        params.push(filters.company_id);
      }
      
      if (filters.search) {
        paramCount++;
        query += ` AND (c.first_name ILIKE $${paramCount} OR c.last_name ILIKE $${paramCount} OR c.email ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }
      
      query += ` ORDER BY c.updated_at DESC`;
      
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }
      
      const result = await client.query(query, params);
      return result.rows;
      
    } finally {
      client.release();
    }
  }
  
  // Update contact
  static async updateContact(userId, contactId, updateData) {
    const client = await pool.connect();
    
    try {
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
      
      const result = await client.query(`
        UPDATE contacts 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND user_id = $2
        RETURNING *
      `, [contactId, userId, ...values]);
      
      if (result.rows.length === 0) {
        throw new Error('Contact not found or access denied');
      }
      
      const contact = result.rows[0];
      
      // Log activity
      await this.logActivity(client, userId, 'note', 'Contact Updated', 
        `Updated contact: ${contact.first_name} ${contact.last_name}`, 'contact', contactId);
      
      return contact;
      
    } finally {
      client.release();
    }
  }
  
  // ===== LEAD MANAGEMENT =====
  
  // Create a new lead
  static async createLead(userId, leadData) {
    const client = await pool.connect();
    
    try {
      const {
        first_name, last_name, email, phone, company_name, job_title,
        industry, lead_score, status, source, source_details, budget,
        timeline, notes, assigned_to
      } = leadData;
      
      const result = await client.query(`
        INSERT INTO leads (
          user_id, first_name, last_name, email, phone, company_name,
          job_title, industry, lead_score, status, source, source_details,
          budget, timeline, notes, assigned_to
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `, [
        userId, first_name, last_name, email, phone, company_name,
        job_title, industry, lead_score || 0, status || 'new', source,
        source_details, budget, timeline, notes, assigned_to
      ]);
      
      const lead = result.rows[0];
      
      // Log activity
      await this.logActivity(client, userId, 'note', 'Lead Created', 
        `Created lead: ${first_name} ${last_name} from ${company_name}`, 'lead', lead.id);
      
      return lead;
      
    } finally {
      client.release();
    }
  }
  
  // Get leads with filtering and pagination
  static async getLeads(userId, filters = {}) {
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT l.*, u.display_name as assigned_to_name
        FROM leads l
        LEFT JOIN users u ON l.assigned_to = u.id
        WHERE l.user_id = $1
      `;
      
      const params = [userId];
      let paramCount = 1;
      
      if (filters.status) {
        paramCount++;
        query += ` AND l.status = $${paramCount}`;
        params.push(filters.status);
      }
      
      if (filters.source) {
        paramCount++;
        query += ` AND l.source = $${paramCount}`;
        params.push(filters.source);
      }
      
      if (filters.assigned_to) {
        paramCount++;
        query += ` AND l.assigned_to = $${paramCount}`;
        params.push(filters.assigned_to);
      }
      
      if (filters.search) {
        paramCount++;
        query += ` AND (l.first_name ILIKE $${paramCount} OR l.last_name ILIKE $${paramCount} OR l.company_name ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }
      
      query += ` ORDER BY l.updated_at DESC`;
      
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }
      
      const result = await client.query(query, params);
      return result.rows;
      
    } finally {
      client.release();
    }
  }
  
  // Get deals for a user
  static async getDeals(userId, filters = {}) {
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT d.*, u.display_name as assigned_to_name,
               c.first_name as contact_first_name, c.last_name as contact_last_name,
               comp.name as company_name
        FROM deals d
        LEFT JOIN users u ON d.assigned_to = u.id
        LEFT JOIN contacts c ON d.contact_id = c.id
        LEFT JOIN companies comp ON d.company_id = comp.id
        WHERE d.user_id = $1
      `;
      
      const params = [userId];
      let paramCount = 1;
      
      if (filters.stage) {
        paramCount++;
        query += ` AND d.stage = $${paramCount}`;
        params.push(filters.stage);
      }
      
      if (filters.assigned_to) {
        paramCount++;
        query += ` AND d.assigned_to = $${paramCount}`;
        params.push(filters.assigned_to);
      }
      
      if (filters.search) {
        paramCount++;
        query += ` AND (d.title ILIKE $${paramCount} OR d.description ILIKE $${paramCount})`;
        params.push(`%${filters.search}%`);
      }
      
      query += ` ORDER BY d.updated_at DESC`;
      
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }
      
      const result = await client.query(query, params);
      return result.rows;
      
    } finally {
      client.release();
    }
  }
  
  // Update lead status
  static async updateLeadStatus(userId, leadId, newStatus, notes = '') {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        UPDATE leads 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `, [newStatus, leadId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Lead not found or access denied');
      }
      
      const lead = result.rows[0];
      
      // Log status change
      await this.logActivity(client, userId, 'note', 'Lead Status Updated', 
        `Lead status changed to: ${newStatus}${notes ? ` - ${notes}` : ''}`, 'lead', leadId);
      
      return lead;
      
    } finally {
      client.release();
    }
  }
  
  // ===== DEAL MANAGEMENT =====
  
  // Create a new deal
  static async createDeal(userId, dealData) {
    const client = await pool.connect();
    
    try {
      const {
        title, description, amount, currency, stage, probability,
        expected_close_date, lead_id, contact_id, company_id,
        lead_source, campaign, notes, assigned_to
      } = dealData;
      
      const result = await client.query(`
        INSERT INTO deals (
          user_id, title, description, amount, currency, stage,
          probability, expected_close_date, lead_id, contact_id,
          company_id, lead_source, campaign, notes, assigned_to
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        userId, title, description, amount, currency, stage || 'prospecting',
        probability || 0, expected_close_date, lead_id, contact_id,
        company_id, lead_source, campaign, notes, assigned_to
      ]);
      
      const deal = result.rows[0];
      
      // Log activity
      await this.logActivity(client, userId, 'note', 'Deal Created', 
        `Created deal: ${title}`, 'deal', deal.id);
      
      return deal;
      
    } finally {
      client.release();
    }
  }
  
  // Update deal stage
  static async updateDealStage(userId, dealId, newStage, notes = '') {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update deal stage
      const result = await client.query(`
        UPDATE deals 
        SET stage = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2 AND user_id = $3
        RETURNING *
      `, [newStage, dealId, userId]);
      
      if (result.rows.length === 0) {
        throw new Error('Deal not found or access denied');
      }
      
      const deal = result.rows[0];
      
      // Record stage change in history
      await client.query(`
        INSERT INTO deal_stage_history (deal_id, stage, changed_by, notes)
        VALUES ($1, $2, $3, $4)
      `, [dealId, newStage, userId, notes]);
      
      // Log activity
      await this.logActivity(client, userId, 'note', 'Deal Stage Updated', 
        `Deal stage changed to: ${newStage}${notes ? ` - ${notes}` : ''}`, 'deal', dealId);
      
      await client.query('COMMIT');
      return deal;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // ===== TASK MANAGEMENT =====
  
  // Create a new task
  static async createTask(userId, taskData) {
    const client = await pool.connect();
    
    try {
      const {
        title, description, due_date, priority, status, type,
        related_to_type, related_to_id, assigned_to
      } = taskData;
      
      const result = await client.query(`
        INSERT INTO crm_tasks (
          user_id, title, description, due_date, priority, status,
          type, related_to_type, related_to_id, assigned_to
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        userId, title, description, due_date, priority || 'medium',
        status || 'pending', type || 'general', related_to_type,
        related_to_id, assigned_to
      ]);
      
      const task = result.rows[0];
      
      // Log activity
      await this.logActivity(client, userId, 'task', 'Task Created', 
        `Created task: ${title}`, 'task', task.id);
      
      return task;
      
    } finally {
      client.release();
    }
  }
  
  // Get tasks for a user
  static async getTasks(userId, filters = {}) {
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT t.*, u.display_name as assigned_to_name
        FROM crm_tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE t.user_id = $1
      `;
      
      const params = [userId];
      let paramCount = 1;
      
      if (filters.status) {
        paramCount++;
        query += ` AND t.status = $${paramCount}`;
        params.push(filters.status);
      }
      
      if (filters.priority) {
        paramCount++;
        query += ` AND t.priority = $${paramCount}`;
        params.push(filters.priority);
      }
      
      if (filters.type) {
        paramCount++;
        query += ` AND t.type = $${paramCount}`;
        params.push(filters.type);
      }
      
      if (filters.assigned_to) {
        paramCount++;
        query += ` AND t.assigned_to = $${paramCount}`;
        params.push(filters.assigned_to);
      }
      
      query += ` ORDER BY t.due_date ASC, t.priority DESC`;
      
      const result = await client.query(query, params);
      return result.rows;
      
    } finally {
      client.release();
    }
  }
  
  // ===== ACTIVITY LOGGING =====
  
  // Log an activity
  static async logActivity(client, userId, type, subject, description, relatedToType = null, relatedToId = null) {
    try {
      await client.query(`
        INSERT INTO activities (
          user_id, type, subject, description, related_to_type, related_to_id
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, type, subject, description, relatedToType, relatedToId]);
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error for activity logging failures
    }
  }
  
  // Get activities for a user
  static async getActivities(userId, filters = {}) {
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT a.*, u.display_name as user_name
        FROM activities a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.user_id = $1
      `;
      
      const params = [userId];
      let paramCount = 1;
      
      if (filters.type) {
        paramCount++;
        query += ` AND a.type = $${paramCount}`;
        params.push(filters.type);
      }
      
      if (filters.related_to_type) {
        paramCount++;
        query += ` AND a.related_to_type = $${paramCount}`;
        params.push(filters.related_to_type);
      }
      
      if (filters.related_to_id) {
        paramCount++;
        query += ` AND a.related_to_id = $${paramCount}`;
        params.push(filters.related_to_id);
      }
      
      query += ` ORDER BY a.activity_date DESC`;
      
      if (filters.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(filters.limit);
      }
      
      const result = await client.query(query, params);
      return result.rows;
      
    } finally {
      client.release();
    }
  }
  
  // ===== DASHBOARD DATA =====
  
  // Get CRM dashboard data
  static async getDashboardData(userId) {
    const client = await pool.connect();
    
    try {
      const result = await client.query(`
        SELECT * FROM crm_dashboard WHERE user_id = $1
      `, [userId]);
      
      if (result.rows.length === 0) {
        return {
          total_contacts: 0,
          total_leads: 0,
          total_deals: 0,
          won_deals: 0,
          lost_deals: 0,
          total_revenue: 0,
          new_leads: 0,
          qualified_leads: 0,
          pending_tasks: 0
        };
      }
      
      return result.rows[0];
      
    } finally {
      client.release();
    }
  }
  
  // ===== COMPANY MANAGEMENT =====
  
  // Create a new company
  static async createCompany(userId, companyData) {
    const client = await pool.connect();
    
    try {
      const {
        name, industry, website, phone, address, annual_revenue,
        employee_count, founded_year, description, tags
      } = companyData;
      
      const result = await client.query(`
        INSERT INTO companies (
          name, industry, website, phone, address, annual_revenue,
          employee_count, founded_year, description, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        name, industry, website, phone, address, annual_revenue,
        employee_count, founded_year, description, tags
      ]);
      
      const company = result.rows[0];
      
      // Log activity
      await this.logActivity(client, userId, 'note', 'Company Created', 
        `Created company: ${name}`, 'company', company.id);
      
      return company;
      
    } finally {
      client.release();
    }
  }
  
  // Get companies
  static async getCompanies(userId, filters = {}) {
    const client = await pool.connect();
    
    try {
      let query = `
        SELECT c.*, 
               COUNT(cont.id) as contact_count,
               COUNT(d.id) as deal_count
        FROM companies c
        LEFT JOIN contacts cont ON c.id = cont.company_id
        LEFT JOIN deals d ON c.id = d.company_id
        GROUP BY c.id
        ORDER BY c.updated_at DESC
      `;
      
      const result = await client.query(query);
      return result.rows;
      
    } finally {
      client.release();
    }
  }
  
  // ===== AI-ENHANCED FEATURES =====
  
  // AI-powered lead scoring
  static async calculateLeadScore(leadData) {
    let score = 0;
    
    // Company size scoring
    if (leadData.employee_count) {
      if (leadData.employee_count > 1000) score += 30;
      else if (leadData.employee_count > 500) score += 25;
      else if (leadData.employee_count > 100) score += 20;
      else if (leadData.employee_count > 50) score += 15;
      else score += 10;
    }
    
    // Budget scoring
    if (leadData.budget) {
      if (leadData.budget > 100000) score += 25;
      else if (leadData.budget > 50000) score += 20;
      else if (leadData.budget > 25000) score += 15;
      else if (leadData.budget > 10000) score += 10;
      else score += 5;
    }
    
    // Timeline scoring
    if (leadData.timeline) {
      const timeline = leadData.timeline.toLowerCase();
      if (timeline.includes('urgent') || timeline.includes('asap')) score += 20;
      else if (timeline.includes('month') || timeline.includes('30 days')) score += 15;
      else if (timeline.includes('quarter') || timeline.includes('90 days')) score += 10;
      else score += 5;
    }
    
    // Source scoring
    if (leadData.source) {
      const source = leadData.source.toLowerCase();
      if (source.includes('referral')) score += 20;
      else if (source.includes('website')) score += 15;
      else if (source.includes('social')) score += 10;
      else score += 5;
    }
    
    return Math.min(score, 100); // Cap at 100
  }
  
  // AI-powered deal probability calculation
  static async calculateDealProbability(dealData, activities) {
    let probability = 0;
    
    // Base probability by stage
    const stageProbabilities = {
      'prospecting': 10,
      'qualification': 25,
      'proposal': 50,
      'negotiation': 75,
      'closed_won': 100,
      'closed_lost': 0
    };
    
    probability = stageProbabilities[dealData.stage] || 0;
    
    // Adjust based on activities
    if (activities && activities.length > 0) {
      const recentActivities = activities.filter(a => 
        new Date(a.activity_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      );
      
      if (recentActivities.length > 5) probability += 10;
      else if (recentActivities.length > 2) probability += 5;
      
      const hasMeeting = recentActivities.some(a => a.type === 'meeting');
      if (hasMeeting) probability += 10;
      
      const hasProposal = recentActivities.some(a => a.type === 'proposal');
      if (hasProposal) probability += 15;
    }
    
    // Adjust based on amount
    if (dealData.amount) {
      if (dealData.amount > 100000) probability += 5;
      else if (dealData.amount > 50000) probability += 3;
    }
    
    return Math.min(Math.max(probability, 0), 100);
  }
}

export default CRMService;
