const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api-puce',
    createProxyMiddleware({
      target: 'https://puce.estudioika.com',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api-puce': '' },
      logLevel: 'silent'
    })
  );
};
