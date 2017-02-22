/* eslint-env browser */
/* global ble, sendButton, statusDiv, Uint8Array, DataView */
var SERVICE_UUID = '3560';
var CHARACTERISTIC_UUID = '3561';

var app = {
  initialize: function () {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    sendButton.disabled = true;
  },
  onDeviceReady: function () {
    app.scan();
    sendButton.addEventListener('click', this.sendValue, false);
  },
  scan: function () {
    ble.startScan([SERVICE_UUID], app.onDiscoverDevice, app.onError);
  },
  onDiscoverDevice: function (device) {
    ble.stopScan(function () {
      ble.connect(device.id, app.onConnect, app.onError);
    });
  },
  onConnect: function (peripheral) {
    app.peripheral = peripheral;
    //window.plugins.toast.showShortCenter('Connected to ' + peripheral.id);
    statusDiv.innerText = 'Connected to ' + peripheral.id;
    sendButton.disabled = false;

    // subscribe to be notified when the value changes
    ble.startNotification(
      peripheral.id,
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      app.onValueChange,
      app.failure
    );

  },
  sendValue: function (e) {
    var value = parseInt(document.querySelector('input[name=value]').value);

    // ensure value fits in one byte
    if (value < 0 || value > 255) {
      var reason = 'Value must be between 0 and 255';
      navigator.notification.alert(reason, {}, 'Value Error');
      return;
    }

    var success = function () {
      statusDiv.innerText = 'Sent ' + value + ' to peripheral';
      console.log('Wrote ' + value + ' to characteristic ' + CHARACTERISTIC_UUID);
    };

    if (app.peripheral && app.peripheral.id) {
      var data = new Uint8Array([value]);
      ble.write(
        app.peripheral.id,
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        data.buffer,
        success,
        app.onError
      );
    }
  },
  onValueChange: function (buffer) {
    var data = new DataView(buffer);
    window.plugins.toast.showShortTop('Notification: value is ' + data.getUint8(0));
  },
  onDisconnect: function (reasonOrPeripheral) {
    statusDiv.innerText = 'Disconnected';
    navigator.notification.alert(reasonOrPeripheral, {}, 'Disconnected');
  },
  onError: function (reason) {
    navigator.notification.alert(reason, {}, 'Error');
  }
};

app.initialize();