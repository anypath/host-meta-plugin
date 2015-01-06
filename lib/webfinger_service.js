const Promise    = require('bluebird');
const rippleName = require('ripple-name');

function WebFingerService(options) {
  this.gatewayd = options.gatewayd;
}

WebFingerService.prototype = {
  build: function(options) {
    var _this = this;
    var address = options.address;

    var webfinger = {
      expires: new Date((new Date()).getTime() + 60 * 60000),
      aliases: [],
      links: _this.gatewayd.hostMeta ? _this.gatewayd.hostMeta.links : []
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
    var addressObject = {
      prefix: fullAddress.substr(0, fullAddress.indexOf(':')),
      address: fullAddress.substr(fullAddress.indexOf(':'))
    };

    return new Promise(function(resolve, reject){
      if (!addressObject.prefix || !addressObject.address) {
        return reject(new Error('Address formatting error'));
      }
      resolve(addressObject);
    });
  },
  _resolve: function (addressObject) {
    var _this = this;

    return new Promise(function(resolve, reject){
      if (addressObject.prefix === 'acct') {
        _this.gatewayd.data.models.externalAccounts.find({
          where: {
            address: addressObject.address
          }
        }).success(function(externalAccount){
          if (externalAccount) {
            resolve({ address: _this.gatewayd.config.get('COLD_WALLET')+'?dt=' + externalAccount.dataValues.id });
          } else {
            return reject(new Error('Gateway user not found'));
          }
        })
        .error(reject);
      } else if (addressObject.prefix === 'ripple') {
        rippleName.lookup(addressObject.address)
          .then(function(user){
            if (!user.exists) {
              return reject(new Error('Ripple user not found'));
            } else {
              resolve(user);
            }
          })
          .error(reject);
      } else {
        return reject(new Error('Unsupported prefix'));
      }
    });
  }
};

module.exports = WebFingerService;

