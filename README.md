# WireGuard Session ![OpenVPN](https://www.wireguard.com/favicon.ico)

Setup a WireGuard connection for the session of your Action's job with automatic setup & cleanup.

## Usage

```yml
- uses: NexRX/WireGuard-Session@v1
  with:
    wg-client: "/path/to/file.ovpn" # Required or `wg-client-b64`, Filepath to a (`.conf`) client

    wg-client-b64: "<base64>" # Required or `wg-client`, Base64 `.conf` file contents

    timeout-address: "10.8.0.1" # Required, The (private) hostname or ip for timeout testing connection to

    log-save-as: "Artifact Name" # Specifiy a name to save the WireGuard logs as an artifact

    log-filepath: "/tmp/wireguard.log" # Filepath for saving the WireGuard logs to [Example is default]

    timeout-seconds: 180 # Seconds before assuming the session & connection has failed [Example is default]
```
You may be wondering why `timeout-address` is required. This is to be certain that a connection (to a device) is guarented if this actions main run succeeds. You can choose the server itself and that is enough.

## Issues?
If you have any issues, feel free to make a issue in the github section.

## Known Issues

### IPv6 is Unsupported - Any IPv6 configuration in your wireguard conf will cause errors. Haven't setup the dependacies yet (if possible) but for now just remove them from the conf passed into this action.
