const bunyan = require('bunyan');
const pm2 = require('pm2');
const pmx = require('pmx');

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
}, (err, conf) => {
  if (err) {
      console.log('error', err);
      return;
  }

  const amqpStream = require('bunyan-logstash-amqp').createStream({
    host: conf.amqpHost,
    vhost: conf.amqpVhost || 'sandbox',
    exchange: {
      name: conf.amqpExchange,
      routingKey: conf.amqpRoutingKey
    },
    login: conf.amqpUser,
    password: conf.amqpPasswd
  })
    .on('connect', () => console.log('Connected to amqp [module]'))
    .on('close', () => console.log('Closed connection to amqp'))
    .on('error', console.log);

  const log = bunyan.createLogger({
    name: conf.logName,
    streams: [{
      level: conf.logLevel,
      type: 'raw',
      stream: amqpStream
    }],
    level: conf.logLevel
  });

  pm2.connect((err) => {
    if (err) {
        console.log('error', err);
        return;
    }

    console.log('info', 'PM2: forwarding to amqp');

    pm2.launchBus((err, bus) => {
      if (err) {
          console.log('error', err);
          return;
      }

      bus.on('log:PM2', function (packet) {
        log.debug(packet.data);
      });
      bus.on('log:out', function (packet) {
        log.debug(packet.data);
      });
      bus.on('log:err', function (packet) {
        log.error(packet.data);
      });
    });
  });

});
