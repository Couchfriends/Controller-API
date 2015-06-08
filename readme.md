# Controller API for Couchfriends
The Couchfriends API can be included in existing webgames to enable real-time gaming.

## Installation
Include the api in the `<head>` of your game.

```html
    // Hosted it in your project
    <script src="/path/to/js/couchfriends.api-latest.js"></script>
    // Using our CDN
    <script src="http://cdn.couchfriends.com/js/couchfriends.api-latest.js"></script>
```

# Building the Couchfriends API

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
    COUCHFRIENDS.settings.host = 'couchfriends.com';
    COUCHFRIENDS.settings.port = '1234';
    COUCHFRIENDS.connect();
```

## Sending data to players/server

You can use the `.send()` function to send data to the server or (one or all) of you connected clients.
Sending data must always be an json object. Following example of hosting a new game.

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