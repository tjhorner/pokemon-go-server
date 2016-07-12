# Unofficial Pokémon GO Server

[![Gitter](https://badges.gitter.im/tjhorner/pokemon-go-server.svg)](https://gitter.im/tjhorner/pokemon-go-server?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

This repo is intended to be a place for an unofficial server for Niantic's GPS/AR game Pokémon GO.

Problem is, we have no idea how the server communicates the client except...

- It uses protobuf
- The only game-related hostname the client contacts is `pgorelease.nianticlabs.com`
- It sends all requests through `/plfe/{rpc_id?}/rpc`
- Once authenticated, the server tells the client which RPC endpoint to send data to for the rest of the session
- The request/response data is broken up into multiple protobuf descriptors:
  - `bridge.proto`
  - `clientrpc.proto`
  - `gmm_layer_rule.proto`
  - `gmm_pref.proto`
  - `gmm_settings.proto`
  - `in_app_purchases.proto`
  - `map.proto`
  - `platform_actions.proto`
  - `signals.proto`
  - `auth/niantic_token.proto`
  - `fortdetails.proto`
  - `gymbattlev2.proto`
  - `holoholo_shared.proto`
  - `inventory.proto`
  - `rpc.proto`
  - `sfida_device.proto`

If you'd like to help us in decoding the protobuf descriptor, [join the Gitter chat](https://gitter.im/tjhorner/pokemon-go-server)!
