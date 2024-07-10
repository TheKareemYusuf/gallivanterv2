require("dotenv").config();


module.exports = {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  SECRET_KEY: process.env.SECRET_KEY,
  SESSION_SECRET: process.env.SESSION_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EXPLORE_PAGE: process.env.EXPLORE_PAGE,

};
