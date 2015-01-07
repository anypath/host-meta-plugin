var express = require('express');
var HostMetaController = require(__dirname+'/controllers/host_meta_controller.js');
var WebFingerController = require(__dirname+'/controllers/webfinger_controller.js');

function HostMetaWebFingerPlugin(options) {
  var router = new express.Router(); 
  var hostMetaController = new HostMetaController({
    gatewayd: options.gatewayd
  });
  var webFingerController = new WebFingerController(options);
  router.get('/host-meta', hostMetaController.get.bind(hostMetaController));
  router.get('/host-meta.json', hostMetaController.get.bind(hostMetaController));
  router.get('/webfinger', webFingerController.get.bind(webFingerController));
  router.get('/webfinger.json', webFingerController.get.bind(webFingerController));
  this.router = router;
}

module.exports = HostMetaWebFingerPlugin;

