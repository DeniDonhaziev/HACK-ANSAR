// Явная загрузка .env для Expo (переменные EXPO_PUBLIC_*)
require('dotenv').config();

const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
  },
};
