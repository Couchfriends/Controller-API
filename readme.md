# Controller API for Couchfriends
With the Couchfriends Controller API you can connect your phone or tablet to your HTML5 game and use it as a controller. The Controller API uses Websockets to send and receive input. See our [Wiki](https://github.com/Couchfriends/Controller-API/wiki) for the complete documentation.

![Controller on Phone](http://couchfriends.com/img/pages/convert-smart-phone-to-gamepad-controller.png)

## Building the Couchfriends API

Download or fork the source in your webroot or project directory and run:

```
npm install
```

To build the latest version run:

```
grunt
```

# Installation

Add the following code in the `<head>` of your game.
```html
<script src="http://cdn.couchfriends.com/api/couchfriends.api-latest.bu.js"></script>
```

## Connect 

Couchfriends api uses the global `window.COUCHFRIENDS` or `COUCHFRIENDS` object variable. The API will automaticly connect to the websocket server.

# API

### Start/host a new game

You can use the `.send()` function to send data to the server or (one or all) of you connected clients.
Sending data must always be an json object. This example will host a new game. See
[Sending data to Players/Server](#sending-data-to-playersserver) for more examples.

## Callbacks

Each data that is received from the server is passed through the `.on('type', function(){});` callback.
 
### on.('connect')

Called after a successful connection to the Websocket server.

```javascript
/**
* Callback after connected to the websocket server and ready for incoming
* players.
* @param string code a unique identifier for players to join this game.
*/
COUCHFRIENDS.on('connect', function(code) {
    console.log('Ready for action! My gamecode is: ' + code);
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
COUCHFRIENDS.on('player.join', function(data) {
    console.log('Player joined. Player id: ' + data.id);
});
```

```javascript
/**
* Player idenfifier (color).
*/
COUCHFRIENDS.on('player.identify', function (data) {
    var color = data.color;
    var playerId = data.player.id;
    // Make the player the color of the controllers layout
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
COUCHFRIENDS.on('player.left', function(data) {
    console.log('Player left. Player id: ' + data.id);
});
```

### on.('buttonUp')
Player pressed or tapped a button.

```javascript
/**
 * Callback when a player disconnect from the game.
 *
 * @param {object} data list with the player information
 * @param {int} data.id the unique identifier of the button. e.g. 'a'
 */
COUCHFRIENDS.on('player.buttonUp', function(data) {
    console.log('Player pressed button. Player id: ' + data.playerId + ' Button: ' + data.id);
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
 */
COUCHFRIENDS.on('player.orientation', function(data) {
    console.log('Player orientation changed. Player id: ' + data.player.id + ' Orientation: ' + data.x + ', ' + data.y);
});
```

### interface.vibrate - Vibrate controller

```javascript
/**
 * Example of letting a phone vibrate.
 * @param topic {string} 'interface'.
 * @param action {string} 'vibrate'. Bzzz
 * @param data {object} list with parameters.
 * @param data.playerId {int} The id of the player to vibrate
 * @param data.duration {int} The duration in ms. Maximum 1000ms.
 */
var jsonData = {
    topic: 'interface',
    action: 'vibrate',
    data: {
        playerId: 1234,
        duration: 200
    }
};
COUCHFRIENDS.send(jsonData);
```