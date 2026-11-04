const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  organization: z.string().max(120).optional(),
  department: z.string().max(100).optional(),
  jurisdiction: z
    .enum(['GDPR (EU)', 'CCPA (California)', 'DPDP (India)', 'LGPD (Brazil)', 'Global Standard'])
    .optional(),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updatePreferencesSchema = z.object({
  essential: z.boolean().optional(),
  analytics: z.boolean().optional(),
  marketing: z.boolean().optional(),
  personalization: z.boolean().optional(),
  thirdPartySharing: z.boolean().optional(),
  reason: z.string().max(300).optional(),
  source: z.enum(['User', 'System', 'Admin', 'Preference Centre', 'Privacy Banner', 'Onboarding']).optional(),
});

const createNoticeSchema = z.object({
  title: z.string().min(5, 'Notice title must be at least 5 characters'),
  version: z.string().min(1, 'Version identifier is required'),
  summaryOfChanges: z.string().min(10, 'Summary of changes is required'),
  content: z.string().min(20, 'Full notice content is required'),
  effectiveDate: z.string().optional(),
  requiresRenewedConsent: z.boolean().optional(),
  isActive: z.boolean().optional(),
  highlights: z.array(z.string()).optional(),
  clauses: z
    .array(
      z.object({
        clauseId: z.string(),
        heading: z.string(),
        body: z.string(),
        category: z.string().optional(),
      })
    )
    .optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updatePreferencesSchema,
  createNoticeSchema,
};

