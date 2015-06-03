# Controller API for Couchfriends
API for the Couchfriends mobile controller interface

## Installation

    <script src="/path/to/couchfriends.api.js"></script>

## API

### Initialize 

Couchfriends api uses the global `window.COUCHFRIENDS` or `COUCHFRIENDS` object variable. Use the following function to initialize the api.

    COUCHFRIENDS.init();

### Callbacks

Each data that is received from the server is passed through the `.on('type', function(){});` callback. For example when you are connected to the server it will call the .on('connect') function.

    COUCHFRIENDS.on('connect', function() {
        // Connected to websocket server and ready for sending and receiving data
    });
