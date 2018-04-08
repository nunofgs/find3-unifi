## Introduction

This application will query your UniFi controller for all active Wi-Fi clients and report them to a FIND3 server.

Each UniFi access point will be reported as a node which will increase the chances of correct indoor positioning.

## Usage

Run the app via docker:

```sh
$ docker run --rm -it -e "DEBUG=*" -e "FIND3_URL=http://localhost:8003" -e … nunofgs/find3-unifi
```

## Environment Variables

Configuration is done through the following environment variables:

| Variable         | Default value | Description                                               |
| ---------------- | ------------- | --------------------------------------------------------- |
| _DEBUG_          | _[n/a]_       | Output debugging information (ex: `*` or `*unifi*`)       |
| _SCAN_INTERVAL_  | _5000_        | The interval at which clients are polled and reported     |
| _FIND3_GROUP_    | _[n/a]_       | The FIND3 family name                                     |
| _FIND3_URL_      | _[n/a]_       | The URL of the FIND3 server (ex: `http://localhost:8003`) |
| _UNIFI_ADDRESS_  | _[n/a]_       | The UniFi server address                                  |
| _UNIFI_PASSWORD_ | _ubnt_        | The UniFi server password                                 |
| _UNIFI_PORT_     | _8443_        | The UniFi server port                                     |
| _UNIFI_SITE_     | _default_     | The UniFi site                                            |
| _UNIFI_USERNAME_ | _admin_       | The UniFi server username                                 |

## License

MIT
