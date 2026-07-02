const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation Error', errors: messages });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ message: `${field} already exists.` });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token.' });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
