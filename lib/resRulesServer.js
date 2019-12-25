
const { URL } = require('url')
const { generateHotLoadClientScript } = require('../notificationServer/injectScript')

module.exports = (server/* , options */) => {
  server.on('request', (req, res) => {
    generateHotLoadClientScript(req.originalReq.ruleValue).then(function (script) {
      const url = new URL(req.originalReq.url)
      res.end(JSON.stringify({
        rules: `${url.host}${url.pathname} includeFilter://resH:Content-Type:text/html jsAppend://{script}`,
        values: {
          script
        }
      }));
    })
  });
};
