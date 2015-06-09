# Controller API for Couchfriends
With the Couchfriends Controller API you can connect your phone or tablet to your HTML5 game and use it as a controller. The Controller API uses Websockets to send and receive input.

## Installation

Add the following code in the `<head>` of your game.
```html
<script src="http://cdn.couchfriends.com/js/couchfriends.api-latest.js"></script>
```

## Building the Couchfriends API

Download or fork the source in your webroot or project directory and run:

```
npm install
```

To build the latest version run:

```
grunt
```

# API

## Connect 

Couchfriends api uses the global `window.COUCHFRIENDS` or `COUCHFRIENDS` object variable. The following code will
connect you to the Couchfriends websocket server.

```javascript
COUCHFRIENDS.settings.apiKey = '<your couchfriends.com api key>';
COUCHFRIENDS.settings.host = 'ws.couchfriends.com';
COUCHFRIENDS.settings.port = '1234';
COUCHFRIENDS.connect();
```

## Sending data to players/server

You can use the `.send()` function to send data to the server or (one or all) of you connected clients.
Sending data must always be an json object. This example will host a new game.

```javascript
/**
 * Request a new game host.
 *
 * @param {string} topic The type of data to send. e.g. 'game'
 * @param {sting} [action] The sub type/action to send. e.g. 'host'
 * @param {object} [data] Additional data to send.
 */a
var jsonData = {
    topic: 'game',
    action: 'host',
    data: { }
};
COUCHFRIENDS.send(jsonData);
```

## Callbacks

Each data that is received from the server is passed through the `.on('type', function(){});` callback.
 
### on.('connect')

Called after a successful connection to the Websocket server.

```javascript
COUCHFRIENDS.on('connect', function() {
    console.log('Ready for action!');
});
```

### on.('gameStart')
Game is started and ready for players to connect.

```javascript
/**
 * Callback after the server started the game and let players allow to join.
 *
 * @param {object} data List with game data
 * @param {string} data.code The game code players need to fill to join this game
 */
COUCHFRIENDS.on('gameStart', function(data) {
    console.log('Game started with code: '+ data.code);
});
```

### on.('playerJoined')
A new player joined the game.

```javascript
/**
 * Callback when a player connected to the game.
 *
 * @param {object} data list with the player information
 * @param {int} data.id The unique identifier of the player
 * @param {string} [data.name] The name of the player
 */
COUCHFRIENDS.on('playerJoined', function(data) {
    console.log('Player joined. Player id: ' + data.id);
});
```

### on.('playerLeft')
One of the players disconnected or left the game.

```javascript
/**
 * Callback when a player disconnect from the game.
 *
 * @param {object} data list with the player information
 * @param {int} data.id the unique identifier of the player that left
 */
COUCHFRIENDS.on('playerLeft', function(data) {
    console.log('Player left. Player id: ' + data.id);
});
```

### on.('playerOrientation')
A player's device orientation has changed.

```javascript
/**
 * Callback when a player chances the orientation of his device. Useful for movement tracking.
 *
 * For performance reasons this function will only be called if the orientation has changed since the previous frame.
 *
 * @param {object} data list with the player id and orientation
 * @param {int} data.id The unique identifier of the player
 * @param {float} [data.x] The x-as orientation (-1 to 1). E.g. -0.871
 * @param {float} [data.y] The y-as orientation (-1 to 1). E.g. 0.12
 * @param {float} [data.z] The z-as orientation (-1 to 1). E.g. -0.301
 */
COUCHFRIENDS.on('playerOrientation', function(data) {
    console.log('Player orientation changed. Player id: ' + data.id + ' Orientation: ' + data.x + ', ' + data.y + ', ' + data.z);
});
```

### on.('playerClick')
A player's tapped/clicked on his device.

```javascript
/**
 * Callback when a player tapped canvas up and down
 *
 * @param {object} data list with the player information
 * @param {int} data.id The unique identifier of the player
 * @param {float} data.x Left position clicked in percentage
 * @param {float} data.y Top position clicked in percentage
 */
COUCHFRIENDS.on('playerClick', function(data) {
    //console.log('Player clicked. Player id: ' + data.id + ' Click position: ' + data.x + ', ' + data.y);
});
```

### on.('playerIdentify')

```javascript
/**
 * Callback when a player changed its name or added additional information like selected color.
 *
 * @param {object} data list with the player information
 * @param {int} data.id The unique identifier of the player
 * @param {float} [data.name] The (new) name of the player. See http://couchfriends.com/pages/profile.html for possible
 * names and characters that might be included in the name.
 */
COUCHFRIENDS.on('playerIdentify', function(data) {
    //console.log('Player with id: '+ data.id +' changed its name to: ' + data.name);
});
```

### on.('buttonClick')

```javascript
/**
 * Callback when a player tapped a button
 *
 * @param {object} data list with the player and button information
 * @param {int} data.id The unique identifier of the button
 * @param {int} data.playerId The unique identifier of the player
 */
COUCHFRIENDS.on('buttonClick', function(data) {
    //console.log('Player clicked a button. Player id: ' + data.playerId + ' Button id: ' + data.id);
});