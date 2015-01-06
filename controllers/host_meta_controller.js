const HostMetaBuilder = require(__dirname+'/../lib/host_meta_service.js');

function HostMetaController(options) {
  this.gatewayd = options.gatewayd;
  this.builder = new HostMetaBuilder(options);
}

HostMetaController.prototype = {
  constructor: HostMetaController,

  get: function(request, response) {
    this.builder.build() 
    .then(function(hostMeta) {
      response
        .status(200)
        .send(hostMeta);
    })
    .error(function(error) {
      response
        .status(500)
        .send({
          error: error
        });
    });
  }
};

module.exports = HostMetaController;

