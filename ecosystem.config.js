module.exports = {
  apps : [{
    name   : "app1",
    script : "./app.js",
    watch: true,
    env: {
      NODE_ENV: 'development',
      PORT: 3008,
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3008,
      DB_HOST: process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD
    }
  }]
}
