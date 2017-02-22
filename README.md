Test project for https://github.com/don/cordova-plugin-ble-central/issues/356

Run the peripheral

    cd peripheral
    npm install
    node .

Run the test app

iOS

    cd cordova
    cordova platform add ios
    cordova prepare
    open platforms/ios/Issue356.xcworkspace

Android

    cd cordova
    cordova platform add android
    cordova run android --device

