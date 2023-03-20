const express = require('express');
const { createBluetooth } = require('node-ble');

const app = express();
const port = 3000;

const { bluetooth, destroy } = createBluetooth();
const adapter = await bluetooth.defaultAdapter();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
