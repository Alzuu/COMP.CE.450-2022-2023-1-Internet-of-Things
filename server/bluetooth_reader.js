const express = require('express');
const cors = require('cors');
const noble = require('@abandonware/noble');

const app = express();
const port = 3000;

app.use(cors());

const headers = {
  'Content-Type': 'text/event-stream',
  Connection: 'keep-alive',
  'Cache-Control': 'no-cache',
};

app.get('/', (req, res) => res.send('hello!'));

app.get('/proximity', (req, res) => {
  res.writeHead(200, headers);

  const interval = setInterval(() => {
    sendProximity(res);
  }, 1000);
});

app.get('/temperature', (req, res) => {
  res.writeHead(200, headers);

  const interval = setInterval(() => {
    sendTemperature(res);
  }, 1000);
});

app.listen(port, () => {
  console.log('SSE listening on port 3000!');
});

proximityServiceUID = '7c8d0422c19711edafa10242ac120002';
proximityCharacteristicUID = 'f4e832acc19711edafa10242ac120002';
weatherServiceUID = '12dfaa88c19811edafa10242ac120002';
temperatureCharacteristicUID = '26dd8136c19811edafa10242ac120002';

let proximity;
let temperature;

noble.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    console.log('Scanning');
    noble.startScanning([weatherServiceUID], true);
  } else {
    console.log('Stopping scanning');
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  // connect to the first peripheral that is scanned and matches the searched uid
  noble.stopScanning();
  const name = peripheral.advertisement.localName;
  console.log(`Connecting to '${name}' ${peripheral.id}`);
  connectAndSetUp(peripheral);
});

function connectAndSetUp(peripheral) {
  peripheral.connect((error) => {
    if (error) {
      console.error(error);
      return;
    }

    console.log('Connected to', peripheral.id);

    // specify the services and characteristics to discover
    const serviceUUIDs = [proximityServiceUID, weatherServiceUID];
    const characteristicUUIDs = [
      proximityCharacteristicUID,
      temperatureCharacteristicUID,
    ];

    peripheral.discoverSomeServicesAndCharacteristics(
      serviceUUIDs,
      characteristicUUIDs,
      onServicesAndCharacteristicsDiscovered
    );
  });

  peripheral.on('disconnect', () => console.log('disconnected'));
}

function onServicesAndCharacteristicsDiscovered(
  error,
  services,
  characteristics
) {
  if (error) {
    console.error(error);
    return;
  }

  console.log('Discovered services and characteristics');
  const proximityCharacteristic = characteristics[0];
  const temperatureCharacteristic = characteristics[1];

  // subscribe to be notified whenever the peripheral updates the characteristics
  proximityCharacteristic.subscribe((error) => {
    if (error) {
      console.error('Error subscribing to proximityCharacteristic');
    } else {
      console.log('Subscribed for proximityCharacteristic notifications');
    }
  });

  temperatureCharacteristic.subscribe((error) => {
    if (error) {
      console.error('Error subscribing to proximityCharacteristic');
    } else {
      console.log('Subscribed for proximityCharacteristic notifications');
    }
  });

  // data callback receives notifications
  proximityCharacteristic.on('data', (data, isNotification) => {
    console.log(`Proximity characteristic data: "${parseProximity(data)}"`);
    proximity = parseProximity(data);
  });

  temperatureCharacteristic.on('data', (data, isNotification) => {
    console.log(`Temperature characteristic data: "${parseTemperature(data)}"`);
    temperature = parseTemperature(data);
  });
}

process.on('SIGINT', function () {
  console.log('Caught interrupt signal');
  noble.stopScanning(() => process.exit());
});

process.on('SIGQUIT', function () {
  console.log('Caught interrupt signal');
  noble.stopScanning(() => process.exit());
});

process.on('SIGTERM', function () {
  console.log('Caught interrupt signal');
  noble.stopScanning(() => process.exit());
});

function parseProximity(data) {
  return parseInt(data.toString('hex'));
}

function parseTemperature(data) {
  return Buffer.from(data).readFloatLE(0).toFixed(2);
}

function sendProximity(res) {
  res.write(`data: ${String(proximity)}\n\n`);
}

function sendTemperature(res) {
  res.write(`data: ${String(temperature)}\n\n`);
}
