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
<script src="http://cdn.couchfriends.com/api/couchfriends.api-latest.js"></script>
```

## Connect 

Couchfriends api uses the global `window.COUCHFRIENDS` or `COUCHFRIENDS` object variable. The following code will
connect you to the Couchfriends websocket server.

```javascript
COUCHFRIENDS.connect();
```


# API

### Start/host a new game

You can use the `.send()` function to send data to the server or (one or all) of you connected clients.
Sending data must always be an json object. This example will host a new game. See
[Sending data to Players/Server](#sending-data-to-playersserver) for more examples.

```javascript
/**
 * Request a new game host.
 *
 * @param {string} topic The type of data to send. e.g. 'game'
 * @param {sting} [action] The sub type/action to send. e.g. 'host'
 * @param {object} [data] Additional data to send.
 */
var jsonData = {
    topic: 'game',
    action: 'host'
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
    // Best place to host a game:
    var jsonData = {
        topic: 'game',
        action: 'host'
    };
    COUCHFRIENDS.send(jsonData);
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

### on.('buttonUp')
Player pressed or tapped a button.

```javascript
/**
 * Callback when a player disconnect from the game.
 *
 * @param {object} data list with the player information
 * @param {int} data.id the unique identifier of the button. e.g. 'a'
 */
COUCHFRIENDS.on('buttonUp', function(data) {
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
COUCHFRIENDS.on('playerOrientation', function(data) {
    console.log('Player orientation changed. Player id: ' + data.id + ' Orientation: ' + data.x + ', ' + data.y);
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