## Description
Just a proof of concept. Work in progress!!

PM2 module that forwards pm2 logs via a AMQP stream. Messages payload ready for [rabbitmq logstash input plugin](https://www.elastic.co/guide/en/logstash/current/plugins-inputs-rabbitmq.html) pulling.

## Install

`pm2 install pm2-amqp-logstash`

## Configure

- `exchange` : exchange name 

#### How to set this value ?

 After having installed the module you have to type :
`pm2 set pm2-logmatic:exchange [exchange]` or go to the Keymetrics dashboard.

## Uninstall

`pm2 uninstall pm2-amqp-logstash`
