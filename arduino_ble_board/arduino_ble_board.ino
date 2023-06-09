// ArduinoBLE - Version: Latest
// Bluetooth Low-Energy library for Nano 33 BLE Sense
#include <ArduinoBLE.h>

// Arduino_APDS9960 - Version: Latest 
// Proximity measurements on Nano 33 BLE Sense
#include <Arduino_APDS9960.h>

// Arduino_HTS221 - Version: Latest 
// Library for temperature and humidity measurements
// on Nano 33 BLE Sense
#include <Arduino_HTS221.h>

const char* nameOfDevice = "adBoardSensor";
// The uids for the services and characteristics offered by the device, generated by random
const char* proximityServiceUUID = "7c8d0422-c197-11ed-afa1-0242ac120002";
const char* proximityCharUUID = "f4e832ac-c197-11ed-afa1-0242ac120002";
const char* billboardCharUUID = "21410f7c-e2a9-11ed-b5ea-0242ac120002";
const char* holdingCharUUID = "83f9f02a-e2a9-11ed-b5ea-0242ac120002";
const char* weatherServiceUUID = "12dfaa88-c198-11ed-afa1-0242ac120002";
const char* temperatureCharUUID = "26dd8136-c198-11ed-afa1-0242ac120002";
const int pinBillboard0 = 11;
const int pinBillboard1 = 10;
unsigned int billboardState = 0;
unsigned int led0state =0;
unsigned int led1state =0;
long previousMillis = 0;
long stayingMillis = 0;

const long intervalChange = 10000;
const long intervalHold = 5000;



// Instanciate the offered services
BLEService proximityService(proximityServiceUUID);
BLEBooleanCharacteristic proximityCharacteristic(proximityCharUUID, BLERead | BLENotify | BLEIndicate);
BLEIntCharacteristic billboardCharacteristic(billboardCharUUID, BLERead | BLENotify | BLEIndicate);
BLEBooleanCharacteristic holdingCharacteristic(holdingCharUUID, BLERead | BLENotify | BLEIndicate);
BLEService weatherService(weatherServiceUUID);
BLEFloatCharacteristic temperatureCharacteristic(temperatureCharUUID, BLERead | BLENotify | BLEIndicate);

void setup() {
  // Open serial port for debugging
  Serial.begin(9600);
  while (!Serial);

  startBLE();
  startTemperatureSensor();
  startProximitySensor();

  Serial.println("BLE started succesfully");

  // Set the BLE parameters that the device advertises
  BLE.setLocalName(nameOfDevice);
  proximityService.addCharacteristic(proximityCharacteristic);
  proximityService.addCharacteristic(billboardCharacteristic);
  proximityService.addCharacteristic(holdingCharacteristic);
  BLE.addService(proximityService);
  BLE.setAdvertisedService(weatherService);
  weatherService.addCharacteristic(temperatureCharacteristic);
  BLE.addService(weatherService);
  BLE.advertise();

  // set initial values for services
  proximityCharacteristic.writeValue(false);
  billboardCharacteristic.writeValue(0);
  holdingCharacteristic.writeValue(false);

  // billboard control
  startOutputLed(pinBillboard0, pinBillboard1);
}

void loop() {  
  BLEDevice central = BLE.central();
  int proximity =0 ;
  // Only write the sensor values if the proximity sensor has a value available, since the temperature sensor is always available
  if (APDS.proximityAvailable()) {
    float temperature = HTS.readTemperature();
    writeTemperature(temperature);
    proximity = APDS.readProximity();
    writeProximity(proximity);
  }
  // billboard timer
  
  // 1. Check if there is someone looking at the board. If yes, stop the timer.
  if (proximity > 200) {
    previousMillis = previousMillis + 1000;
    stayingMillis = 0;
    resetLed();
  } else {
    stayingMillis = stayingMillis + 1000;
  }
  if (previousMillis > intervalChange){
    billboardState = toggleLED(billboardState, pinBillboard0, pinBillboard1);
    previousMillis = 0;
  }
  if (stayingMillis > intervalHold) {
    blinkLED(billboardState, pinBillboard0, pinBillboard1);
  }

  writeBillboardData(billboardState);

  delay(1000);
}

void writeTemperature(float temperature) {
  Serial.print("Temperature = ");
  Serial.print(temperature);
  Serial.println(" °C");
  temperatureCharacteristic.writeValue(temperature);
}

void writeProximity(int proximity) {
  Serial.print("Proximity = ");
  Serial.println(proximity);
  // Convert proximity to a boolean value, to approximate whether a person is
  // in front of the ad board or not
  if (proximity > 200) {
    proximityCharacteristic.writeValue(false);
  }
  else {
    proximityCharacteristic.writeValue(true);
  }
 
}

void writeBillboardData(int billboardState) {
  Serial.print("LED = ");
  Serial.println(billboardState);
  billboardCharacteristic.writeValue(billboardState);
}

void startBLE() {
  if (!BLE.begin())
  {
    Serial.println("starting BLE failed!");
    while (1);
  }
}

void startTemperatureSensor() {
  if (!HTS.begin()) {
    Serial.println("Failed to initialize humidity temperature sensor!");
    while (1);
  }  
}

void startProximitySensor() {
  if (!APDS.begin()) {
    Serial.println("Error initializing APDS-9960 sensor!");
    while(1);
  }
}

void startOutputLed(int pin0, int pin1) {
  pinMode(pin0, OUTPUT);
  pinMode(pin1, OUTPUT);
  // Initial state: Billboard 0
  digitalWrite(pin0, HIGH);
  digitalWrite(pin1, LOW);
  billboardState = 0;
  led0state = 1;
  led1state = 0;
  
}

int toggleLED(int billboardState, int pin0, int pin1) {
  int newBillboardState = 0;
  if (billboardState == 0) {
    // change to billboard 1
    digitalWrite(pin0, LOW);
    digitalWrite(pin1, HIGH);
    led0state = 0;
    led1state = 1;
    newBillboardState = 1;
  } else {
    // change to billboard 0
    digitalWrite(pin0, HIGH);
    digitalWrite(pin1, LOW);
    newBillboardState = 0;
    led0state = 1;
    led1state = 0;
  }
  return newBillboardState;
}

void blinkLED(int billboardState, int pin0, int pin1) {
  if (billboardState == 0) {
    if (led0state == 0){
      digitalWrite(pin0, HIGH);
      digitalWrite(pin1, LOW);
      led0state = 1;
    } else {
      digitalWrite(pin0, LOW);
      digitalWrite(pin1, LOW);
      led0state = 0;
    }

  } else {
    if (led1state == 0){

      digitalWrite(pin0, LOW);
      digitalWrite(pin1, HIGH);
      led1state = 1;
    } else {
      digitalWrite(pin0, LOW);
      digitalWrite(pin1, LOW);
      led1state = 0;
    }
  }
  Serial.println("HOLDING MODE: ON");
  holdingCharacteristic.writeValue(true);
}

void resetLed() {
  if (billboardState == 0){
    digitalWrite(pinBillboard0, HIGH);
    digitalWrite(pinBillboard1, LOW);
    led0state = 1;
  } else {
    digitalWrite(pinBillboard0, LOW);
    digitalWrite(pinBillboard1, HIGH);
    led1state = 1;
  }
  Serial.println("HOLDING MODE: OFF");
  holdingCharacteristic.writeValue(false);
}

