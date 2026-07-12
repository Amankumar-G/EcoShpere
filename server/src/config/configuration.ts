const configuration = () => ({
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN_SECONDS ?? '86400', 10),
  },
});
export default configuration;
