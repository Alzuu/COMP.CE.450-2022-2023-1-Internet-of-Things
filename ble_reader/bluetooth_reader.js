const noble = require('@abandonware/noble')

proximityServiceUID = "7c8d0422c19711edafa10242ac120002";
proximityCharacteristicUID = "f4e832acc19711edafa10242ac120002";
weatherServiceUID = "12dfaa88c19811edafa10242ac120002";
temperatureCharacteristicUID = "26dd8136c19811edafa10242ac120002";

noble.on("stateChange", (state) => {
  if (state === "poweredOn") {
    console.log("Scanning");
    noble.startScanning([proximityServiceUID], true);
  } else {
    console.log("Stopping scanning")
    noble.stopScanning();
  }
});

noble.on("discover", (peripheral) => {
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

    console.log("Connected to", peripheral.id);

    // specify the services and characteristics to discover
    const serviceUUIDs = [proximityServiceUID, weatherServiceUID];
    const characteristicUUIDs = [proximityCharacteristicUID, temperatureCharacteristicUID];

    peripheral.discoverSomeServicesAndCharacteristics(
      serviceUUIDs,
      characteristicUUIDs,
      onServicesAndCharacteristicsDiscovered
    );
  });

  peripheral.on("disconnect", () => console.log("disconnected"));
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

  console.log("Discovered services and characteristics");
  const proximityCharacteristic = characteristics[0];
  const temperatureCharacteristic = characteristics[1];

  // data callback receives notifications
  proximityCharacteristic.on("data", (data, isNotification) => {
    console.log(`Proximity characteristic data: "${data}"`);
  });

  temperatureCharacteristic.on("data", (data, isNotification) => {
    console.log(`Temperature characteristic data: "${data}"`);
  });

  // subscribe to be notified whenever the peripheral updates the characteristics
  proximityCharacteristic.subscribe((error) => {
    if (error) {
      console.error("Error subscribing to proximityCharacteristic");
    } else {
      console.log("Subscribed for proximityCharacteristic notifications");
    }
  });

  temperatureCharacteristic.subscribe((error) => {
    if (error) {
      console.error("Error subscribing to proximityCharacteristic");
    } else {
      console.log("Subscribed for proximityCharacteristic notifications");
    }
  });
}

process.on("SIGINT", function () {
  console.log("Caught interrupt signal");
  noble.stopScanning(() => process.exit());
});

process.on("SIGQUIT", function () {
  console.log("Caught interrupt signal");
  noble.stopScanning(() => process.exit());
});

process.on("SIGTERM", function () {
  console.log("Caught interrupt signal");
  noble.stopScanning(() => process.exit());
});



