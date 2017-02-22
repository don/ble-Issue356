var bleno = require('bleno');
var util = require('util');
var value = 0;

var PrimaryService = bleno.PrimaryService;
var updateSubscriber;

var Characteristic = function () {
  Characteristic.super_.call(this, {
    uuid: '3561',
    properties: ['read', 'write', 'notify'],
  });
};
util.inherits(Characteristic, bleno.Characteristic);

Characteristic.prototype.onReadRequest = function (offset, callback) {
  console.log('read request');
  var data = new Buffer([value]);
  callback(this.RESULT_SUCCESS, data);
};

Characteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
  console.log('write request: 0x' + data.toString('hex') + ' ' + data[0]);
  value = data[0];
  callback(this.RESULT_SUCCESS);
  if (updateSubscriber) {
    updateSubscriber(data);
  }
};

Characteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
  console.log('subscribe');
  
  updateSubscriber = function(value) {
    console.log('Passing 0x' + value.toString('hex') + ' back to the subscriber');
    updateValueCallback(value);
  };

};

var service = new PrimaryService({
  uuid: '3560',
  characteristics: [
    new Characteristic()
  ]
});

bleno.on('stateChange', function (state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Issue356', [service.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function (error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([service]);
  }
});
