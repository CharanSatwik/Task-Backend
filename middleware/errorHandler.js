/**
 * Middleware to handle malformed JSON syntax errors in request bodies.
 */
const jsonParseErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Malformed JSON payload in request body.'
    });
  }
  next(err);
};

/**
 * Middleware to handle 404 for unhandled routes.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl} - Route not found.`
  });
};

/**
 * Centralized global error handler middleware.
 */
const globalErrorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error'
  });
};

module.exports = {
  jsonParseErrorHandler,
  notFoundHandler,
  globalErrorHandler
};
