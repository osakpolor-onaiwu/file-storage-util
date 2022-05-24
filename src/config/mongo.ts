import dotenv from 'dotenv';
dotenv.config();

const dbConfig = {
  mongoUri: `${process.env.DB_HOST}${process.env.DB_NAME}`,
  config: {
    useNewUrlParser: true,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    serverSelectionTimeoutMS: 30000,
    // keepAlive: true,
  },
};
export default dbConfig;
