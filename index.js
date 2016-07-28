var express = require('express'),
    protobuf = require('protobufjs'),
    path = require('path'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    httpProxy = require('http-proxy');

var protoBuilder = protobuf.loadProtoFile({ root: path.join(__dirname,'./'), file: "POGOProtos/POGOProtos.proto" });
    proto = protoBuilder.build("POGOProtos");

var int64 = require('int64');

var hex2dec = int64.hex2dec;
var dec2hex = int64.dec2hex;

// console.log(proto);

var RequestEnvelope = proto.Networking.Envelopes.RequestEnvelope,
    ResponseEnvelope = proto.Networking.Envelopes.ResponseEnvelope,
    Request = proto.Networking.Requests.Request;

// console.log(RequestEnvelop);

var app = express();

var assetDigestAndroid = fs.readFileSync("./asset_digest");

var concat = require('concat-stream');

app.use(function(req, res, next){
  req.pipe(concat(function(data){
    req.body = data;
    next();
  }));
});

// app.use(bodyParser.raw());
// app.use(bodyParser.text());

var envelopResponse = (status, id, response, shouldIncludeAuthTicket, unknown6)=>{
  // console.log(unknown6);
  var finalRes = new ResponseEnvelope({
    status_code: status,
    unknown6: new proto.Networking.Envelopes.Unknown6Response({
      response_type: 6,
      response_data: new proto.Networking.Envelopes.Unknown6Response.Unknown2({
        unknown1: 1
      })
    }),
    request_id: id,
    returns: response
  });

  if(shouldIncludeAuthTicket){
    finalRes.auth_ticket = new proto.Networking.Envelopes.AuthTicket({
      start: new Buffer("This is auth ticket"),
      expire_timestamp_ms: 9999999999999,
      end: new Buffer("This is auth ticket end")
    });
  }

  return finalRes.encode().toBuffer();
};

app.get("/*", function(req, res){
  console.log("request");
  res.send("k");
});

var playerData = new proto.Data.PlayerData({
  creation_timestamp_ms: 1467936859925,
  username: "asdasdasd",
  tutorial_state: [
    0, 1, 3, 4, 7
  ],
  team: 3,
  avatar: new proto.Data.Player.PlayerAvatar({
    pants: 1,
    shoes: 1,
    gender: 1,
    eyes: 2
  }),
  max_pokemon_storage: 250,
  max_item_storage: 350,
  // daily_bonus: new proto.Data.Player.DailyBonus(),
  // equipped_badge: new proto.Data.Player.EquippedBadge(),
  // contact_settings: new proto.Data.Player.ContactSettings(),
  currencies: [
    new proto.Data.Player.Currency({
      name: "POKECOIN",
      amount: 500
    }),
    new proto.Data.Player.Currency({
      name: "STARDUST",
      amount: 5000
    })
  ]
});

var answerRequests = (requests, authTicket)=>{
  var returns = [];

  requests.forEach((request)=>{
    // TODO make each of these requests have their own function...
    var requestData = request.request_message;
    switch(request.request_type){
      case 2: // GetPlayer
        returns.push(new proto.Networking.Responses.GetPlayerResponse({
          success: true,
          player_data: playerData
        }).encode());
        break;
      case 126: // GetHatchedEggs
        returns.push(new proto.Networking.Responses.GetHatchedEggsResponse({
          success: true
        }).encode());
        break;
      case 4: // GetInventory
        returns.push(new proto.Networking.Responses.GetInventoryResponse({
          success: true,
          inventory_delta: new proto.Inventory.InventoryDelta({
            original_timestamp_ms: new Date().getTime * 1000,
            new_timestamp_ms: new Date().getTime * 1000,
            inventory_items: [
              new proto.Inventory.InventoryItem({
                inventory_item_data: new proto.Inventory.InventoryItemData({
                  // example
                  pokemon_data: new proto.Data.PokemonData({
                    id: 123781297398,
                    pokemon_id: 25,
                    cp: 10000000000,
                    is_egg: false,
                    height_m: 100,
                    weight_kg: 1,
                    move_1: 219,
                    move_2: 26,
                    deployed_fort_id: 0,
                    owner_name: "",
                    origin: 0,
                    individual_attack: 100,
                    individual_defense: 100,
                    individual_stamina: 100,
                    cp_multiplier: 100,
                    pokeball: 1,
                    creation_time_ms: new Date().getTime() * 1000
                  })
                })
              }),
              new proto.Inventory.InventoryItem({
                inventory_item_data: new proto.Inventory.InventoryItemData({
                  item: new proto.Inventory.Item({
                    item_id: 4,
                    count: 1000
                  })
                })
              })
            ]
          })
        }).encode());
        break;
      case 129: // CheckAwardedBadges
        returns.push(new proto.Networking.Responses.CheckAwardedBadgesResponse({
          success: true
        }).encode());
        break;
      case 5: // DownloadSettings
        if(requestData){
          returns.push(new proto.Networking.Responses.DownloadSettingsResponse({
            hash: "05daf51635c82611d1aac95c0b051d3ec088a930"
          }).encode());
        }else{
          returns.push(new proto.Networking.Responses.DownloadSettingsResponse({
            hash: "05daf51635c82611d1aac95c0b051d3ec088a930",
            settings: new proto.Settings.GlobalSettings({
              fort_settings: new proto.Settings.FortSettings({
                interaction_range_meters: 200,
                max_total_deployed_pokemon: 10,
                max_player_deployed_pokemon: 1,
                deploy_stamina_multiplier: 500,
                far_interaction_range_meters: 250
              }),
              map_settings: new proto.Settings.MapSettings({
                pokemon_visible_range: 300,
                poke_nav_range_meters: 300,
                encounter_range_meters: 300,
                get_map_objects_min_refresh_seconds: 5,
                get_map_objects_max_refresh_seconds: 20,
                google_maps_api_key: "AIzaSyDF9rkP8lhcddBtvH9gVFzjnNo13WtmJIM"
              }),
              // level_settings: new proto.Settings.LevelSettings(), // client doesn't expect this
              inventory_settings: new proto.Settings.InventorySettings({
                max_pokemon: 1000,
                max_bag_items: 1000,
                base_pokemon: 250,
                base_bag_items: 350,
                base_eggs: 1000
              }),
              minimum_client_version: "0.29.0" // I guess update this every update? lol
            })
          }).encode());
        }
        break;
      case 7: // DownloadRemoteConfigVersion
        returns.push(new proto.Networking.Responses.DownloadRemoteConfigVersionResponse({
          result: 1,
          item_templates_timestamp_ms: 1468540960537,
          asset_digest_timestamp_ms: 1467338276561000
        }).encode());
        break;
      case 300: // GetAssetDigest -- loaded from a file!
        returns.push(assetDigestAndroid);
        break;
      case 121: // GetPlayerProfile
        returns.push(new proto.Networking.Responses.GetPlayerProfileResponse({
          result: proto.Networking.Responses.GetPlayerProfileResponse.Result.SUCCESS,
          start_time: new Date().getTime() * 1000,
          badges: [ ]
        }).encode());
        break;
      case 106: // GetMapObjects
        var cells = proto.Networking.Requests.Messages.GetMapObjectsMessage.decode(request.request_message.toBuffer()).cell_id;

        var cellsRes = [ ];
        cells.forEach((cell)=>{
          cellsRes.push(new proto.Map.MapCell({
            s2_cell_id: cell,
            current_timestamp_ms: new Date().getTime() * 1000,
            forts: [
              new proto.Map.Fort.FortData({
                id: "goodfort",
                last_modified_timestamp_ms: new Date().getTime() * 1000,
                latitude: 33.108770,
                longitude: -117.244344,
                owned_by_team: 3,
                guard_pokemon_id: 150,
                guard_pokemon_cp: 2000,
                gym_points: 100000,
                is_in_battle: false,
                enabled: true,
                type: proto.Map.Fort.FortType.GYM,
                sponsor: proto.Map.Fort.FortSponsor.MCDONALDS,
                rendering_type: proto.Map.Fort.FortRenderingType.DEFAULT
              })
            ],
            spawn_points: [ ],
            deleted_objects: [ ],
            is_truncated_list: false,
            fort_summaries: [ ],
            decimated_spawn_points: [ ],
            wild_pokemons: [ ],
            catchable_pokemons: [ ],
            nearby_pokemons: [ ]
          }));
        });

        returns.push(new proto.Networking.Responses.GetMapObjectsResponse({
          status: 1,
          map_cells: cellsRes
        }).encode());
        break;
      case 406: // 
        returns.push(new proto.Networking.Responses.MarkTutorialCompleteResponse({
          success: true,
          player_data: playerData
        }).encode());
        break;
      case 404: // SetAvatar
        returns.push(new proto.Networking.Responses.SetAvatarResponse({
          status: 1,
          player_data: playerData
        }).encode());
        break;
      case 301: // GetDownloadUrls
        console.log("We have no idea how to respond to GetDownloadUrls!");
        console.log(proto.Networking.Requests.Messages.GetDownloadUrlsMessage.decode(request.request_message.toBuffer()));
        returns.push(new proto.Networking.Responses.GetDownloadUrlsResponse({ }).encode());
        break;
      case 104: // FortDetails
        returns.push(new proto.Networking.Responses.FortDetailsResponse({ }).encode());
        break;
      default: // Unknown!
        console.log("UNKNOWN REQUEST!", request.request_type);
        // returns.push(new Buffer().toBuffer());
        break;
    }
  });

  return returns;
}

var isFirstRequest = true;

app.post("/*", function(req, res){
  console.log("Got a request");
  try{
    var protoReq = RequestEnvelope.decode(req.body);
    console.log(protoReq);
    // if(protoReq.unknown6){
    //   // console.log(protoReq.unknown6.unknown2.unknown1.toBuffer().toString());
    // }
    if(isFirstRequest){
      isFirstRequest = false;
      res.send(new ResponseEnvelope({
        status_code: 53,
        request_id: protoReq.request_id,
        api_url: "pgorelease.nianticlabs.com/custom",
        auth_ticket: new proto.Networking.Envelopes.AuthTicket({
          start: new Buffer("This is auth ticket"),
          expire_timestamp_ms: 9999999999999,
          end: new Buffer("This is auth ticket end")
        })
      }).encode().toBuffer());
    }else{
      // console.log(protoReq);
      var authTicket = { },
          includeAuthTicketInRes = true;
      if(protoReq.auth_ticket){
        // we could use our own authentication here since the client just repeats
        // whatever we send it for this
        authTicket.start = protoReq.auth_ticket.start.toBuffer().toString();
        authTicket.end = protoReq.auth_ticket.end.toBuffer().toString();
        authTicket.expire = protoReq.auth_ticket.expire_timestamp_ms;
        includeAuthTicketInRes = false;
      }
      console.log("Received RPC call with these requests:", protoReq.requests.map((request)=>{ return request.request_type; }).join(", "));
      res.send(envelopResponse(1, protoReq.request_id, answerRequests(protoReq.requests, authTicket), includeAuthTicketInRes, protoReq.unknown6));
    }
  }catch(e){
    console.log("ERROR! VERY BAD NO BUENO REEEEE", e);
    // console.log("Client sent bad request. Is your proxy set up properly?");
    res.send("BAD.");
  }
});

app.listen(3000);
