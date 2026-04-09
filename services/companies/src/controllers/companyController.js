const { validationResult } = require('express-validator');
const Company = require('../models/Company');

const ALLOWED_UPDATE_FIELDS = ['name', 'phone', 'address', 'city', 'country', 'description', 'services'];

// POST /register — authenticated user registers their company (starts as pending)
const registerCompany = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const existing = await Company.findByOwnerId(req.userId);
    if (existing) {
      return res.status(409).json({ message: 'You have already registered a company.' });
    }

    const { name, email, phone, address, city, country, license_number, description, services } = req.body;

    const [byEmail, byLicense] = await Promise.all([
      Company.findByEmail(email),
      Company.findByLicense(license_number),
    ]);
    if (byEmail)   return res.status(409).json({ message: 'A company with this email already exists.' });
    if (byLicense) return res.status(409).json({ message: 'A company with this license number already exists.' });

    const company = await Company.create({
      name, email, phone, address, city, country,
      license_number, description, services,
      owner_id: req.userId,
    });

    res.status(201).json(company);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Company email or license number already exists.' });
    }
    console.error('registerCompany error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /me — get the authenticated user's company
const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findByOwnerId(req.userId);
    if (!company) return res.status(404).json({ message: 'No company found for this account.' });
    res.json(company);
  } catch (err) {
    console.error('getMyCompany error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /me — update the authenticated user's company (limited fields)
const updateMyCompany = async (req, res) => {
  try {
    const fields = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (req.body[key] !== undefined) fields[key] = req.body[key];
    }
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: 'No updatable fields provided.' });
    }

    const company = await Company.updateByOwnerId(req.userId, fields);
    if (!company) return res.status(404).json({ message: 'No company found for this account.' });
    res.json(company);
  } catch (err) {
    console.error('updateMyCompany error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET / — admin: list all companies with pagination + optional status filter
const getAllCompanies = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const status = ['pending', 'active', 'suspended'].includes(req.query.status)
      ? req.query.status : undefined;

    const result = await Company.findAll({ page, limit, status });
    res.json(result);
  } catch (err) {
    console.error('getAllCompanies error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// GET /:id — admin: get a single company by ID
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found.' });
    res.json(company);
  } catch (err) {
    console.error('getCompanyById error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PATCH /:id/status — admin: approve, suspend, or reset a company
const updateCompanyStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be: pending | active | suspended' });
    }

    const company = await Company.update(req.params.id, { status });
    if (!company) return res.status(404).json({ message: 'Company not found.' });
    res.json(company);
  } catch (err) {
    console.error('updateCompanyStatus error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// DELETE /:id — admin: remove a company
const deleteCompany = async (req, res) => {
  try {
    const result = await Company.remove(req.params.id);
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Company not found.' });
    res.json({ message: 'Company deleted.' });
  } catch (err) {
    console.error('deleteCompany error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  registerCompany,
  getMyCompany,
  updateMyCompany,
  getAllCompanies,
  getCompanyById,
  updateCompanyStatus,
  deleteCompany,
};
