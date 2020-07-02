module.exports = {
  apps: [{
    name: 'STAGE-API',
    script: './build/index.js',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      MONGO_URI: 'mongodb+srv://startsco:cHab7chu@cluster0-f5v2u.mongodb.net/test?retryWrites=true&w=majority'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
