# Controller API for Couchfriends
API for the Couchfriends mobile controller interface

## Installation

```html
    <script src="/path/to/couchfriends.api.js"></script>
```

# API

## Connect 

Couchfriends api uses the global `window.COUCHFRIENDS` or `COUCHFRIENDS` object variable. The following code will
connect you to the Couchfriends websocket server.

```js
    COUCHFRIENDS.settings.apiKey = '<your couchfriends.com api key>';
    COUCHFRIENDS.settings.host = 'couchfriends.com';
    COUCHFRIENDS.settings.port = '1234';
    COUCHFRIENDS.connect();
```

## Sending data to players/server

You can use the `.send()` function to send data to the server or (one or all) of you connected clients.
Sending data must always be an json object with the following parameters:

* @param {string} `topic` The type of data to send. e.g. `game`
* @param {sting} [`action`] The sub type/action to send. e.g. `host`
* @param {object} [`data`] Additional data to send.

The following example will request the server to host a new game. See the `.on('gameStart');` callback for more info.

```js
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

```js
    COUCHFRIENDS.on('connect', function() {
        console.log('Ready for action!');
    });
```

### on.('gameStart')
Game is started and ready for players to connect.

```js
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