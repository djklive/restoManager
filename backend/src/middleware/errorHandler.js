export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_ERROR";
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Une erreur est survenue"
      : err.message;

  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.path} — ${code}:`,
    err
  );

  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
};
