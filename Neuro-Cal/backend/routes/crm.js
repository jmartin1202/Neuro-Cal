import express from 'express';
import { body, validationResult } from 'express-validator';
import CRMService from '../services/crmService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all CRM routes
router.use(authenticateToken);

// ===== CONTACT ROUTES =====

// Get all contacts for the authenticated user
router.get('/contacts', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      company_id: req.query.company_id,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };
    
    const contacts = await CRMService.getContacts(req.user.id, filters);
    res.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
  }
});

// Create a new contact
router.post('/contacts', [
  body('first_name').notEmpty().trim().withMessage('First name is required'),
  body('last_name').notEmpty().trim().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().trim(),
  body('mobile').optional().trim(),
  body('job_title').optional().trim(),
  body('department').optional().trim(),
  body('company_id').optional().isUUID().withMessage('Invalid company ID'),
  body('lead_score').optional().isInt({ min: 0, max: 100 }).withMessage('Lead score must be 0-100'),
  body('status').optional().isIn(['active', 'inactive', 'prospect', 'customer', 'partner']).withMessage('Invalid status'),
  body('source').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const contact = await CRMService.createContact(req.user.id, req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ success: false, error: 'Failed to create contact' });
  }
});

// Update a contact
router.put('/contacts/:id', [
  body('first_name').optional().trim(),
  body('last_name').optional().trim(),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().trim(),
  body('mobile').optional().trim(),
  body('job_title').optional().trim(),
  body('department').optional().trim(),
  body('company_id').optional().isUUID().withMessage('Invalid company ID'),
  body('lead_score').optional().isInt({ min: 0, max: 100 }).withMessage('Lead score must be 0-100'),
  body('status').optional().isIn(['active', 'inactive', 'prospect', 'customer', 'partner']).withMessage('Invalid status'),
  body('source').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const contact = await CRMService.updateContact(req.user.id, req.params.id, req.body);
    res.json({ success: true, data: contact });
  } catch (error) {
    console.error('Error updating contact:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({ success: false, error: 'Contact not found' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update contact' });
    }
  }
});

// ===== LEAD ROUTES =====

// Get all leads for the authenticated user
router.get('/leads', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      source: req.query.source,
      assigned_to: req.query.assigned_to,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };
    
    const leads = await CRMService.getLeads(req.user.id, filters);
    res.json({ success: true, data: leads });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch leads' });
  }
});

// Create a new lead
router.post('/leads', [
  body('first_name').notEmpty().trim().withMessage('First name is required'),
  body('last_name').notEmpty().trim().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('phone').optional().trim(),
  body('company_name').optional().trim(),
  body('job_title').optional().trim(),
  body('industry').optional().trim(),
  body('lead_score').optional().isInt({ min: 0, max: 100 }).withMessage('Lead score must be 0-100'),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).withMessage('Invalid status'),
  body('source').optional().trim(),
  body('source_details').optional().trim(),
  body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  body('timeline').optional().trim(),
  body('notes').optional().trim(),
  body('assigned_to').optional().isUUID().withMessage('Invalid assigned user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    // Calculate AI-powered lead score if not provided
    if (!req.body.lead_score) {
      req.body.lead_score = await CRMService.calculateLeadScore(req.body);
    }
    
    const lead = await CRMService.createLead(req.user.id, req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ success: false, error: 'Failed to create lead' });
  }
});

// Update lead status
router.patch('/leads/:id/status', [
  body('status').isIn(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).withMessage('Invalid status'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const lead = await CRMService.updateLeadStatus(req.user.id, req.params.id, req.body.status, req.body.notes);
    res.json({ success: true, data: lead });
  } catch (error) {
    console.error('Error updating lead status:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({ success: false, error: 'Lead not found' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update lead status' });
    }
  }
});

// ===== DEAL ROUTES =====

// Get all deals for the authenticated user
router.get('/deals', async (req, res) => {
  try {
    const filters = {
      stage: req.query.stage,
      assigned_to: req.query.assigned_to,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };
    
    const deals = await CRMService.getDeals(req.user.id, filters);
    res.json({ success: true, data: deals });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch deals' });
  }
});

// Create a new deal
router.post('/deals', [
  body('title').notEmpty().trim().withMessage('Deal title is required'),
  body('description').optional().trim(),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('stage').optional().isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).withMessage('Invalid stage'),
  body('probability').optional().isInt({ min: 0, max: 100 }).withMessage('Probability must be 0-100'),
  body('expected_close_date').optional().isISO8601().withMessage('Invalid date format'),
  body('lead_id').optional().isUUID().withMessage('Invalid lead ID'),
  body('contact_id').optional().isUUID().withMessage('Invalid contact ID'),
  body('company_id').optional().isUUID().withMessage('Invalid company ID'),
  body('lead_source').optional().trim(),
  body('campaign').optional().trim(),
  body('notes').optional().trim(),
  body('assigned_to').optional().isUUID().withMessage('Invalid assigned user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const deal = await CRMService.createDeal(req.user.id, req.body);
    res.status(201).json({ success: true, data: deal });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ success: false, error: 'Failed to create deal' });
  }
});

// Update deal stage
router.patch('/deals/:id/stage', [
  body('stage').isIn(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).withMessage('Invalid stage'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const deal = await CRMService.updateDealStage(req.user.id, req.params.id, req.body.stage, req.body.notes);
    res.json({ success: true, data: deal });
  } catch (error) {
    console.error('Error updating deal stage:', error);
    if (error.message.includes('not found')) {
      res.status(404).json({ success: false, error: 'Deal not found' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update deal stage' });
    }
  }
});

// ===== TASK ROUTES =====

// Get all tasks for the authenticated user
router.get('/tasks', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      type: req.query.type,
      assigned_to: req.query.assigned_to,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };
    
    const tasks = await CRMService.getTasks(req.user.id, filters);
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
});

// Create a new task
router.post('/tasks', [
  body('title').notEmpty().trim().withMessage('Task title is required'),
  body('description').optional().trim(),
  body('due_date').optional().isISO8601().withMessage('Invalid date format'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('type').optional().isIn(['call', 'email', 'meeting', 'follow_up', 'proposal', 'general']).withMessage('Invalid type'),
  body('related_to_type').optional().isIn(['contact', 'lead', 'deal', 'company']).withMessage('Invalid related type'),
  body('related_to_id').optional().isUUID().withMessage('Invalid related ID'),
  body('assigned_to').optional().isUUID().withMessage('Invalid assigned user ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const task = await CRMService.createTask(req.user.id, req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
});

// ===== ACTIVITY ROUTES =====

// Get all activities for the authenticated user
router.get('/activities', async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      related_to_type: req.query.related_to_type,
      related_to_id: req.query.related_to_id,
      limit: req.query.limit ? parseInt(req.query.limit) : null
    };
    
    const activities = await CRMService.getActivities(req.user.id, filters);
    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch activities' });
  }
});

// ===== COMPANY ROUTES =====

// Get all companies
router.get('/companies', async (req, res) => {
  try {
    const companies = await CRMService.getCompanies(req.user.id);
    res.json({ success: true, data: companies });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch companies' });
  }
});

// Create a new company
router.post('/companies', [
  body('name').notEmpty().trim().withMessage('Company name is required'),
  body('industry').optional().trim(),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('phone').optional().trim(),
  body('address').optional().isObject().withMessage('Address must be an object'),
  body('annual_revenue').optional().isFloat({ min: 0 }).withMessage('Annual revenue must be a positive number'),
  body('employee_count').optional().isInt({ min: 1 }).withMessage('Employee count must be a positive integer'),
  body('founded_year').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Invalid founded year'),
  body('description').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const company = await CRMService.createCompany(req.user.id, req.body);
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ success: false, error: 'Failed to create company' });
  }
});

// ===== DASHBOARD ROUTES =====

// Get CRM dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const dashboardData = await CRMService.getDashboardData(req.user.id);
    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

// ===== AI-ENHANCED ROUTES =====

// Calculate lead score using AI
router.post('/ai/lead-score', [
  body('lead_data').isObject().withMessage('Lead data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const score = await CRMService.calculateLeadScore(req.body.lead_data);
    res.json({ success: true, data: { lead_score: score } });
  } catch (error) {
    console.error('Error calculating lead score:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate lead score' });
  }
});

// Calculate deal probability using AI
router.post('/ai/deal-probability', [
  body('deal_data').isObject().withMessage('Deal data is required'),
  body('activities').optional().isArray().withMessage('Activities must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    
    const probability = await CRMService.calculateDealProbability(req.body.deal_data, req.body.activities);
    res.json({ success: true, data: { probability } });
  } catch (error) {
    console.error('Error calculating deal probability:', error);
    res.status(500).json({ success: false, error: 'Failed to calculate deal probability' });
  }
});

export default router;
