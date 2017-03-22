
var bunyan = require('bunyan');
var pm2 = require('pm2');
var pmx = require('pmx');

pmx.initModule({

  widget: {

    logo: 'http://semicomplete.com/presentations/logstash-monitorama-2013/images/elasticsearch.png',

    theme: ['#141A1F', '#222222', '#3ff', '#3ff'],

    el: {
      probes: false,
      actions: false
    },

    block: {
      actions: false,
      issues: false,
      meta: false,

    }

  }

}, function (err, conf) {

  var amqp_stream = require('bunyan-logstash-amqp').createStream({
    host: "192.168.99.100",
    exchange: {
      name: 'logs',
      routingKey: 'test'
    }
  })
    .on('connect', function () {
      console.log("Connected to amqp [module]");
    })
    .on('close', function () { console.log("Closed connection to amqp"); })
    .on('error', console.log);

  var log = bunyan.createLogger({
    name: 'log-stream',
    streams: [{
      level: 'debug',
      type: "raw",
      stream: amqp_stream
    }],
    level: 'debug'
  });

  pm2.connect(function () {
    console.log('info', 'PM2: forwarding to amqp');
    pm2.launchBus(function (err, bus) {
      bus.on('log:PM2', function (packet) {
        log.debug(packet.data);
      })
      bus.on('log:out', function (packet) {
        log.debug(packet.data);
      });
      bus.on('log:err', function (packet) {
        log.error(packet.data);
      });
    });
  })
});
