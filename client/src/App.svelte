<script>
  import { onMount } from 'svelte';
  import { createBluetooth } from 'node-ble';

  const { bluetooth, destroy } = createBluetooth();

  let data = [];

  onMount(async () => {
    await setupBLE();
  });

  async function setupBLE() {
    // Get adapter
    const adapter = await bluetooth.defaultAdapter();

    // Start discovering
    if (!(await adapter.isDiscovering())) {
      await adapter.startDiscovery();
    }

    // Get a device, Connect and Get GATT server
    const device = await adapter.waitDevice('uuid');
    await device.connect();
    const gattServer = await device.gatt();

    // Subscribe to a characteristic
    const service = await gattServer.getPrimaryService('uuid');
    const characteristic = await service.getCharacteristic('uuid');
    await characteristic.startNotifications();
    characteristic.on('valuechanged', (buffer) => {
      console.log(buffer);
      data.push(buffer);
    });
  }

  async function stop(device) {
    await device.disconnect();
    destroy();
  }
</script>

<main>
  <h1>Proximity analyzer</h1>
</main>

<style>
</style>
