var Promise = require('bluebird');

function HostMetaBuilder(options) {
  this.gatewayd = options.gatewayd;
}

HostMetaBuilder.prototype = {
  constructor: HostMetaBuilder,
  
  build: function build() {
    var _this = this;
    var hostMeta = {};
    var properties = {};

    var domain = _this.gatewayd.config.get('DOMAIN');
    var coldWallet = _this.gatewayd.config.get('COLD_WALLET');

    hostMeta.subject = 'https://' + domain;
    hostMeta.expires = new Date((new Date()).getTime() + 60 * 60000);
    hostMeta.aliases = [
      'ripple:' + coldWallet
    ];
    properties.name = 'Gateway';
    properties.description = 'Ripple Gateway';
    properties['rl:type'] = 'gateway';
    properties['rl:domain'] = domain;
    properties['rl:accounts'] = [{
      'address': coldWallet,
      'rl:currencies': _this.gatewayd.config.get('CURRENCIES')
    }];
    properties['rl:hotwallets'] = [
      _this.gatewayd.config.get('HOT_WALLET').address
    ];
    hostMeta.properties = properties;
    hostMeta.links = _this.gatewayd.hostMeta ? _this.gatewayd.hostMeta.getLinks() : [];

    return Promise.resolve(hostMeta);
  }
};

module.exports = HostMetaBuilder;

