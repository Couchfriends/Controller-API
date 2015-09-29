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
COUCHFRIENDS.settings.apiKey = '<your couchfriends.com api key>'; // Not needed for testing purposes
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
 * @param {string} [data.sessionKey] The key for the game. This is needed to unlock achievements
 */
var jsonData = {
    topic: 'game',
    action: 'host',
    data: {
        sessionKey: 'abc'
    }
};
COUCHFRIENDS.send(jsonData);
```

### Example: Add default controller buttons A, B, X and Y

Use the following code after a player connected and it will automatically add the default A-B-X and Y buttons to the gamepad.

![Gamepad on phone](http://couchfriends.com/img/pages/gamepad-a-b-x-y-buttons-phone.jpg)

```javascript
var jsonData = {
    topic: 'interface',
    action: 'buttonAdd',
    data: {
        id: 'a-b-x-y',
        playerId: 1234 // The id of the connected player. See 'playerJoined' callback.
    }
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
```

## Sending data to players/server

Use the `COUCHFRIENDS.send()` function to send data to your connected players. `send()` always required a json object
and should at least contain `topic`, `action` and `data`.

```javascript
var dataJson {
    topic: 'game',
    action: 'host'
    data: {}
}
```

### interface.buttonAdd - Display a button

Add a button on the players controller.

```javascript
/**
 * Example of sending a button to the controller
 * @param topic {string} 'interface'. We changing the players interface.
 * @param action {string} 'buttonAdd'. Adding a button.
 * @param data {object} list with additional settings and options.
 * @param data.id {string} unique identifier of the button. This ID will be send back when the player interact with it.
 * @param data.playerId {int} The id of the player who should see the button.
 * @param [data.type] {string} What kind of button. 'square' or 'circle' are currently supported. Default is 'circle'.
 * @param [data.label] {string} The label to write on the button. Default will be 'A'. Might be empty.
 * @param [data.labelColor] {string} The color of the text of the label. Default '#ffffff'.
 * @param [data.labelFont] {string} The style and size of the font. Default 'bold 22px Arial'.
 * @param [data.color] {string} A hex color code for the background of the button.
 * @param [data.size] {object} Size of the button. Either 'radius' if circle or 'width'/'height' for 'square'.
 * @param [data.size.radius] {int} The radius size in pixels.
 * @param [data.size.width] {int|string} The width in pixels (int) or percentages (string). e.g. '25%'.
 * @param [data.size.height] {int|string} The height in pixels (int) or percentages (string). e.g. '25%'.
 * @param [data.position] {object} The position of the button. Top, left, bottom and right. Int for pixels or string for
 * percentages. e.g. left: '50%' or top: 16.
 */
var jsonData = {
    topic: 'interface',
    action: 'buttonAdd',
    data: {
        id: 'shootBall',
        playerId: 1234,
        type: 'circle',
        label: 'Shoot!',
        labelColor: '#ffffff',
        labelFont: 'bold 22px Arial',
        color: '#ff0000',
        size: {
            radius: 32,
            width: 64,
            height: 64
        },
        position: {
            top: '50%',
            left: '50%',
            bottom: '',
            right: ''
        }
    }
};
COUCHFRIENDS.send(jsonData);
```

### interface.buttonRemove - Removes a button

```javascript
/**
 * Example of sending a button to the controller
 * @param topic {string} 'interface'. We changing the players interface.
 * @param action {string} 'buttonRemove'. Remove a button.
 * @param data {object} list with parameters.
 * @param data.id {string} unique identifier of the button.
 * @param data.playerId {int} The id of the player where the button should be removed.
 */
var jsonData = {
    topic: 'interface',
    action: 'buttonRemove',
    data: {
        id: 'shootBall',
        playerId: 1234
    }
};
COUCHFRIENDS.send(jsonData);
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