require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || 3000,
  ws: true,
  changeOrigin: true,
  dbUser:  process.env.DB_USER,
  dbPassword:  process.env.DB_PASSWORD,
  dbHost:  process.env.DB_HOST,
  dbName:  process.env.DB_NAME,
  dbPort:  process.env.DB_PORT,
  accessToken:  process.env.ATS,
  refreshToken:  process.env.RTS,
  mailUser: process.env.MAIL_APP_USER,
  mailPass: process.env.MAIL_APP_PSWD,
}

module.exports = { config };
