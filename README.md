# Unofficial Pokémon GO Server

[![Gitter](https://badges.gitter.im/tjhorner/pokemon-go-server.svg)](https://gitter.im/tjhorner/pokemon-go-server?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![Slack](https://shielded-earth-81203.herokuapp.com/badge.svg)](https://shielded-earth-81203.herokuapp.com/badge.svg)

This is a very incomplete and very badly written Pokemon GO server. I'm in the
middle of creating it, so if you'd like to help then don't hesitate to send a
PR!

## Usage

`npm install && node index`

Then get some proxy that you can connect your phone to (I use Fiddler), and forward
all requests from `pgorelease.nianticlabs.com` to `localhost:3000`. It doesn't
matter what endpoint you send it to, it listens for POSTs everywhere.

[Guide for Fiddler here](https://github.com/tjhorner/pokemon-go-server/wiki/Fiddler-Instructions)

## Supported RPC Requests

Most of these are incomplete and are just for testing.

- GetPlayer
- GetHatchedEggs
- GetInventory
- CheckAwardedBadges
- DownloadSettings
- DownloadRemoteConfigVersion
- GetAssetDigest
- GetPlayerProfile
- GetMapObjects
- MarkTutorialComplete
- SetAvatar
- GetDownloadUrls
- FortDetails

## Known Issues

What's an issue tracker anyway?

- Client doesn't respond to GetPlayer message correctly (we're probably sending it wrong)
  - Name doesn't appear
  - XP doesn't appear
  - Team isn't set correctly
  - Black box in player profile screen
- Client freezes after selecting a Pokestop sent by server
- Various other things

## Todo

- Don't put every response in a single file...
