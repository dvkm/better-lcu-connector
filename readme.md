
# better-lcu-connector

## Installation

### Npm

```sh
$ npm i better-lcu-connector
```

### Git

```git
$ git clone https://github.com/botkalista/better-lcu-connector.git
```

## Usage examples

### Handle messages with filters

```javascript
const LcuConnector = require('better-lcu-connector');
const connector = new LcuConnector();

connector.addHandler('/lol-chat/v1/me','*',(uri,method,data) =>{
    //manage /lol-chat/v1/me events
})

connector.addHandler('*','UPDATE',(uri,method,data) =>{
    //manage UPDATE events
})

connector.addHandler('/lol-chat/v1/me','CREATE',(uri,method,data) =>{
    //manage /lol-chat/v1/me CREATE events
})

connector.addHandler('/lol-chat/v1/me','*',(uri,method,data) =>{
    //manage all events
})

 
connector.listen();
```

### Handle messages with events override

```javascript
const LcuConnector = require('better-lcu-connector');
const connector = new LcuConnector();

connector.events.onPlayerStatusChange = (data) => { //your code here }

connector.listen();
```

## Events

[**onPlayerStatusChange**](#onPlayerStatusChange) - Fires when changes : icon, status message, online state, game state

## Events documentation


### onPlayerStatusChange

**Event managed: `/lol-chat/v1-me`**
<br>
**Methods managed: `CREATE` `UPDATE` `DELETE`**
<br>
**Returns: `{Object}`**
<br>
**Object properties:**
<br>

 - **availability** { *dnd | online | offline | mobile* } - See [**AVAILABILITIES**](docs/availabilities.md)
- **basic** { *string* }
- **gameName** { *string* }
- **gameTag** { *string* }
- **icon** { *number* } - Summoner icon's ID
- **id** { *number* } - Summoner's ID
- **lol** { *Object* }
  - **championId** { *number* } - Playing champion's ID
  - **companionId** { *number* }
  - **gameId** { *number* } - Match ID
  - **gameMode** { *string* } - See [**GAME MODES**](docs/game-modes.md)
  - **gameQueueType** { *string* }
  - **gameStatus** { *inGame | outOfGame* }
  - **isObservable** { *NONE | LOBBYONLY | ALL* }
  - **level** { *number* } - Summoner's level
  - **mapId** { *number* } - See [**MAPS**](docs/maps-constants.md)
  - **queueId** { *number* }
  - **rankedLeagueDivision** { *I | II | III | IV* } - Player's rank  division
  - **rankedLeagueQueue** { *RANKED_SOLO_5v5 | RANKED_FLEX_5v5* } - Current queue type if ranked or highest rank queue 
  - **rankedLeagueTier** { *UNRANKED | IRON | BRONZE | SILVER | GOLD | PLATINIUM | DIAMOND | MASTER | GRANDMASTER | CHALLENGER* } Player's rank tier
  - **rankedLosses** { *number*} - Always 0
  - **rankedSplitRewardLevel** { *number* }
  - **rankedWins** { *number* } - Number wins in ranked games
  - **regalia** { *string* }
  - **skinVariant** { *number* } - Current skin ID
  - **skinname** { *string* } - Current playing champion name
  - **timestamp** { *number* } - Game start time
- **name** { *string* } - Summoner's name
- **patchline** { *any* }
- **pid** { *any* }
- **product** { *string* } - Always "league_of_legends"
- **productName** { *any* }
- **statusMessage** { *string* } - Player status message
- **summary** { *any* }
- **summonerId** { *number* } - Summoner ID
- **time** { *any* }