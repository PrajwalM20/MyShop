const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || process.env.SERVER_URL || 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api',
      },
    })
  );
  app.use(
    '/uploads',
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL || process.env.SERVER_URL || 'http://localhost:5000',
      changeOrigin: true,
    })
  );
};