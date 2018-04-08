'use strict';

/**
 * Module dependencies.
 */

const { Controller } = require('node-unifi');
const { post } = require('axios');
const { promisify } = require('util');
const kebabCase = require('lodash.kebabcase');
const log = require('debugnyan')('find3-unifi');
const processManager = require('@uphold/process-manager');

/**
 * Configuration.
 */

const {
  SCAN_INTERVAL = 5000,
  FIND3_GROUP,
  FIND3_URL,
  UNIFI_ADDRESS,
  UNIFI_PASSWORD = 'ubnt',
  UNIFI_PORT = 8443,
  UNIFI_SITE = 'default',
  UNIFI_USERNAME = 'admin'
} = process.env;

const controller = new Controller(UNIFI_ADDRESS, UNIFI_PORT);
const getAccessDevices = promisify(controller.getAccessDevices);
const getClientDevices = promisify(controller.getClientDevices);
const login = promisify(controller.login);

processManager.once(async () => {
  await login(UNIFI_USERNAME, UNIFI_PASSWORD);

  // Retrieve devices (wireless Access Points) from unifi.
  const [devices] = await getAccessDevices(UNIFI_SITE);
  const wirelessDevices = devices.filter(device => 'wifi_caps' in device);

  await processManager.loop(async () => {
    const [clients] = await getClientDevices(UNIFI_SITE);
    const timestamp = Date.now();

    for (const device of wirelessDevices) {
      // Filter all clients by access point.
      const clientsByDevice = clients.filter(client => !client.is_wired && client.ap_mac === device.mac);

      if (!clientsByDevice.length) {
        continue;
      }

      log.debug({ clients: clientsByDevice.map(({ hostname, name }) => hostname || name) }, `Retrieved ${clientsByDevice.length} wireless clients`);

      // Construct the payload which contains all known clients, per device.
      const wifi = clientsByDevice.reduce((result, client) => ({
        [client.mac]: client.signal,
        ...result
      }), {});

      const payload = {
        d: kebabCase(device.name),
        f: FIND3_GROUP,
        s: { wifi },
        t: timestamp
      };

      // Send passive signals to the Find3 server.
      const { data: { message, success } } = await post(`${FIND3_URL}/passive`, payload);

      if (!success) {
        log.error({ message, payload }, `Could not submit passive data for device '${device.name}'`);
      }

      log.debug(`Pushed ${clientsByDevice.length} wireless clients from device '${device.name}' to find3 server successfully`);
    }
  }, { interval: SCAN_INTERVAL });
});
