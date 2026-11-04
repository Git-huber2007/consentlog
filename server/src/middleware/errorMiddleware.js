/**
 * Centralized Error Handling & Not-Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  // Explicitly flag any attempt to call PUT/PATCH/DELETE on /api/audit/logs
  if (
    req.originalUrl.startsWith('/api/audit') &&
    ['PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())
  ) {
    return res.status(403).json({
      success: false,
      error: 'IMMUTABLE_AUDIT_VIOLATION',
      message: `SECURITY POLICY: ConsentLog audit records are strictly append-only. HTTP ${req.method} on ${req.originalUrl} is permanently prohibited.`,
    });
  }

  const error = new Error(`Endpoint Not Found - ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Internal Server Error';

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource identifier format: ${err.value}`;
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with that ${field} already exists.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join('. ');
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('. ');
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};

