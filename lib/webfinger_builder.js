const Promise = require('bluebird');
const rippleName = require('ripple-name');
const bitcoinAddress = require('bitcoin-address');

function WebFingerBuilder(options) {
  this.gatewayd = options.gatewayd;
}

WebFingerBuilder.prototype = {
  build: function(options) {
    var _this = this;
    var address = options.address;

    var webfinger = {
      expires: new Date((new Date()).getTime() + 60 * 60000),
      aliases: [],
      links: _this.gatewayd.hostMeta ? _this.gatewayd.hostMeta.getWebfingerLinks() : []
    };

    webfinger.properties = {};

    return new Promise(function(resolve, reject) {
      _this._validate(address)
        .then(function(addressObject){
          webfinger.subject = addressObject.address;
          _this._resolve(addressObject)
            .then(function(user){
              if (user.username) {
                webfinger.aliases.push('ripple:'+user.username);
              }
              if (user.address) {
                webfinger.aliases.push(user.address);
              }
              resolve(webfinger);
            })
            .error(reject);
        })
        .error(reject);
    });
  },
  _validate: function (fullAddress) {
    var _this = this;
    var address = fullAddress.split(':');
    var addressObject = {};

    return new Promise(function(resolve, reject){
      if (address.length < 2) {
        return reject(new Error('AddressFromattingError'));
      }

      addressObject.prefix = address[0];
      addressObject.address = address[1];

      if (addressObject.prefix === 'bitcoin' && !bitcoinAddress.validate(addressObject.address)) {
        return reject(new Error('InvalidBitcoinAddress'));
      }

      if (addressObject.prefix === 'acct' && !_this.gatewayd.validator.isEmail(addressObject.address)) {
        return reject(new Error('InvalidEmailFormat'));
      }

      resolve(addressObject);

    });
  },
  _resolve: function (addressObject) {
    var _this = this;

    return new Promise(function(resolve, reject){

      if (addressObject.prefix === 'acct' || addressObject.prefix === 'bitcoin') {
        _this.gatewayd.data.models.externalAccounts.findOrCreate({
          address: addressObject.address,
          type: 'coinbase'
        })
        .success(function(externalAccount){
          if (externalAccount) {
            resolve({ address: _this.gatewayd.config.get('COLD_WALLET')+'?dt='+externalAccount.dataValues.id });
          } else {
            return reject(new Error('GatewayUserNotFound'));
          }
        })
        .error(reject);
      }

      if (addressObject.prefix === 'ripple') {
        rippleName.lookup(addressObject.address)
          .then(function(user){
            if (!user.exists) {
              return reject(new Error('RippleUserNotFound'));
            } else {
              resolve(user);
            }
          })
          .error(reject);
      }

    });

  }
};

module.exports = WebFingerBuilder;

