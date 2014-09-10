const WebFingerBuilder = require(__dirname+'/webfinger_builder.js');
const qs = require('qs');
const url = require('url');

function WebfingerController(options) {
  this.webFingerBuilder = new WebFingerBuilder(options);
}

WebfingerController.prototype = {
  constructor: WebfingerController,

  get: function(request, response) {
    var data = {};
    data.address =  qs.parse(request.query)['resource'];
    this.webFingerBuilder.build(data)
    .then(function(webFinger) {
      response
        .status(200)
        .send(webFinger);
    })
    .error(function(error) {
      response
        .status(500)
        .send({
          success: false,
          error: error
        })
    })

  }
}

module.exports = WebfingerController;

