module.exports = {
  apps: [
    {
      name: 'ts-node-app', // Name of your app
      script: 'dist/src/server.js', // Path to your built server file
      instances: 1, // pm2 instance count
      autorestart: true, // auto restart if process crash
      exec_mode: 'cluster', // Running in cluster mode for load balancing
      env: {
        NODE_ENV: 'development', // Set the environment to development by default
      },
      env_production: {
        NODE_ENV: 'production', // Set the environment to production when deploying
      },
    },
  ],

  deploy: {
    production: {
      user: 'your-user', // Your SSH user
      host: 'your-server-ip', // Your server's IP address or domain
      ref: 'origin/main', // Git branch to deploy from
      repo: 'git@github.com:your-username/your-repo.git', // Git repository URL
      path: '/path/to/your/deployment/folder', // Path where the app will be deployed
      'post-deploy':
        'npm install && npm run build && pm2 reload ecosystem.config.js --env production', // Commands to run after deployment
      env: {
        NODE_ENV: 'production', // Set the environment to production
      },
    },
  },
};
