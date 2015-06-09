"use strict";
/**
 * Couchfriends controller api. This file can be used in your game to enable multiplayer games and interaction with the
 * Couchfriends platform
 *
 * @copyright (c) 2015 Mathieu de Ruiter, Couchfriends, Fellicht & Editors
 * @author Mathieu de Ruiter / http://www.fellicht.nl/
 *
 * For detailed information about the development with the Couchfriends API please visit http://couchfriends.com
 *
 */

/**
 * component/emitter
 *
 * Copyright (c) 2014 Component contributors <dev@component.io>
 */
function Emitter(t){return t?mixin(t):void 0}function mixin(t){for(var e in Emitter.prototype)t[e]=Emitter.prototype[e];return t}Emitter.prototype.on=Emitter.prototype.addEventListener=function(t,e){return this._callbacks=this._callbacks||{},(this._callbacks["$"+t]=this._callbacks["$"+t]||[]).push(e),this},Emitter.prototype.once=function(t,e){function i(){this.off(t,i),e.apply(this,arguments)}return i.fn=e,this.on(t,i),this},Emitter.prototype.off=Emitter.prototype.removeListener=Emitter.prototype.removeAllListeners=Emitter.prototype.removeEventListener=function(t,e){if(this._callbacks=this._callbacks||{},0==arguments.length)return this._callbacks={},this;var i=this._callbacks["$"+t];if(!i)return this;if(1==arguments.length)return delete this._callbacks["$"+t],this;for(var r,s=0;s<i.length;s++)if(r=i[s],r===e||r.fn===e){i.splice(s,1);break}return this},Emitter.prototype.emit=function(t){this._callbacks=this._callbacks||{};var e=[].slice.call(arguments,1),i=this._callbacks["$"+t];if(i){i=i.slice(0);for(var r=0,s=i.length;s>r;++r)i[r].apply(this,e)}return this},Emitter.prototype.listeners=function(t){return this._callbacks=this._callbacks||{},this._callbacks["$"+t]||[]},Emitter.prototype.hasListeners=function(t){return!!this.listeners(t).length};

var COUCHFRIENDS = {
    REVISION: '3',
    _INIT: false,
    _socket: {}, // The Websocket object
    _connectedPlayers: [],
    _gameCode: '',
    // Object with current information and state over the game
    status: {
        connected: false
    },
    /**
     * Global settings for COUCHFRIENDS api
     * @type {object} settings list of settings
     */
    settings: {
        apiKey: '',
        host: '',
        port: '',
        ui: {
            showNotifications: true,
            showHowTo: true
        }
    }
};

/**
 * (Temporary) Array with all possible incoming callbacks <type>.<topic> => COUCHFRIENDS.on(<result>, function(data) { });
 * @type {Array}
 */
COUCHFRIENDS.callbacks = [];
COUCHFRIENDS.callbacks['game.start'] = 'gameStart';
COUCHFRIENDS.callbacks['player.left'] = 'playerLeft';
COUCHFRIENDS.callbacks['player.join'] = 'playerJoined';
COUCHFRIENDS.callbacks['player.orientation'] = 'playerOrientation';
COUCHFRIENDS.callbacks['player.click'] = 'playerClick';
COUCHFRIENDS.callbacks['player.identify'] = 'playerIdentify';
COUCHFRIENDS.callbacks['error'] = 'error';

/**
 * Init some javascript and styles to the game for dynamic overviews
 */
COUCHFRIENDS.init = function () {
    COUCHFRIENDS._INIT = true;
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = 'http://cdn.couchfriends.com/js/couchfriends.ui.css';
    link.href = 'http://localhost/couchfriends-controller-api/src/couchfriends.ui.css';
    link.media = 'all';
    head.appendChild(link);
    var containerDiv = document.createElement("div");
    containerDiv.id = 'COUCHFRIENDS-overlay';
    containerDiv.innerHTML = '<div id="COUCHFRIENDS-popup"></div><div id="COUCHFRIENDS-notifications"></div>';
    document.body.appendChild(containerDiv);
};

/**
 * Show notification and remove it after a short delay
 * @param message
 */
COUCHFRIENDS.showNotification = function (message) {
    if (COUCHFRIENDS.settings.ui.showNotifications == false) {
        return;
    }
    var id = Date.now();
    var notificationEl = document.createElement("div");
    notificationEl.className = 'COUCHFRIENDS-notification';
    notificationEl.id = 'COUCHFRIENDS-'+ id;
    notificationEl.innerHTML = '<p>' + message +'</p>';
    document.getElementById('COUCHFRIENDS-notifications').appendChild(notificationEl);
    setTimeout(function() {
        document.getElementById('COUCHFRIENDS-' + id).className = "COUCHFRIENDS-notification COUCHFRIENDS-notification-close";
        setTimeout(function() {
            var node = document.getElementById('COUCHFRIENDS-' + id);
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }, 1000);
    }, 3500);
};

COUCHFRIENDS.showHideHowToPopup = function() {
    if (COUCHFRIENDS.settings.showHowTo == false) {
        document.getElementById('COUCHFRIENDS-popup').style.display = 'none';
        return;
    }
    if (COUCHFRIENDS._connectedPlayers.length > 0 || COUCHFRIENDS._gameCode == '') {
        if (document.getElementById('COUCHFRIENDS-popup').offsetParent === null) {
            return;
        }
        document.getElementById('COUCHFRIENDS-popup').className = 'COUCHFRIENDS-fadeOut';
        return;
    }
    var message = 'Go to <strong class="COUCHFRIENDS-underline">www.couchfriends.com</strong> with your <strong>phone</strong> or <strong>tablet</strong> and enter the code <strong id="COUCHFRIENDS-code">' + COUCHFRIENDS._gameCode +'</strong>';
    document.getElementById('COUCHFRIENDS-popup').innerHTML = message;
    if (document.getElementById('COUCHFRIENDS-popup').offsetParent !== null) {
        document.getElementById('COUCHFRIENDS-popup').className = 'COUCHFRIENDS-fadeIn';
    }
};

/**
 * Connect function. This will connect the game to the websocket server.
 *
 * @returns {void|bool} false on error or return void. See the .on('connect', function() { }) callback for more info.
 */
var counter = 0;
COUCHFRIENDS.connect = function () {

    if (COUCHFRIENDS._INIT == false) {
        COUCHFRIENDS.init();
    }
    if (typeof WebSocket == 'undefined') {
        COUCHFRIENDS.emit('error', 'Websockets are not supported by device.');
        return false;
    }
    if (COUCHFRIENDS.settings.host == '' || COUCHFRIENDS.settings.port == '') {
        COUCHFRIENDS.emit('error', 'Host or port is empty.');
        return false;
    }
    if (COUCHFRIENDS.status.connected == true) {
        return false;
    }
    COUCHFRIENDS._socket = new WebSocket("ws://" + COUCHFRIENDS.settings.host + ":" + COUCHFRIENDS.settings.port);

    COUCHFRIENDS._socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
        var callback = '';
        if (typeof data.topic == 'string') {
            callback += data.topic;
        }
        if (typeof data.action == 'string') {
            callback += '.' + data.action;
        }
        if (typeof COUCHFRIENDS.callbacks[callback] == 'undefined') {
            return;
        }
        /**
         * Internal functions
         */
        COUCHFRIENDS.emit('_' + COUCHFRIENDS.callbacks[callback], data.data);
        COUCHFRIENDS.emit(COUCHFRIENDS.callbacks[callback], data.data);
    };
    COUCHFRIENDS._socket.onopen = function() {
        COUCHFRIENDS.status.connected = true;
        COUCHFRIENDS.emit('connect');
    };
    COUCHFRIENDS._socket.onclose = function () {
        COUCHFRIENDS.status.connected = false;
        COUCHFRIENDS.emit('disconnect');
    };

};

/**
 * Send data to the server/controller
 *
 * @param data Object object with data to send. See Api references for all available options.
 */
COUCHFRIENDS.send = function (data) {

    if (COUCHFRIENDS.status.connected == false) {
        COUCHFRIENDS.emit('error', 'Message not send because game is not connected to server.');
        return false;
    }
    COUCHFRIENDS._socket.send(JSON.stringify(data));
};

Emitter(COUCHFRIENDS);

/**
 * Callback when an error has occurred.
 *
 * @param {object} data list with error details.
 * @param {string} data.message the error
 */
COUCHFRIENDS.on('error', function(data) {
});

/**
 * Callback after connection to the WebSocket server is successful. Best practise will be hosting a new game after
 * a successful connection.
 */
COUCHFRIENDS.on('connect', function() {
});

/**
 * Callback after the connection is lost from the WebSocket server.
 */
COUCHFRIENDS.on('disconnect', function() {
});

/**
 * Callback after the connection is lost from the WebSocket server.
 */
COUCHFRIENDS.on('_disconnect', function() {
    COUCHFRIENDS._gameCode = '';
});

/**
 * Callback after the server started the game and let players allow to join.
 *
 * @param {object} data List with game data
 * @param {string} data.code The game code players need to fill to join this game
 */
COUCHFRIENDS.on('gameStart', function(data) {
    //console.log('Game started with code: '+ data.code);
});

COUCHFRIENDS.on('_gameStart', function(data) {
    COUCHFRIENDS._gameCode = data.code;
    COUCHFRIENDS.showHideHowToPopup();
});

/**
 * Callback when a player disconnect from the game.
 *
 * @param {object} data list with the player information
 * @param {int} data.id the unique identifier of the player that left
 */
COUCHFRIENDS.on('playerLeft', function(data) {
    //console.log('Player left. Player id: ' + data.id);
});
COUCHFRIENDS.on('_playerLeft', function(data) {
    //console.log('Player joined. Player id: ' + data.id);
    var playerName = data.id;
    if (data.name != null) {
        playerName = data.name;
    }
    COUCHFRIENDS.showNotification('Player "' + playerName + '" left.');
    COUCHFRIENDS._connectedPlayers.splice(COUCHFRIENDS._connectedPlayers.indexOf(data.id), 1);
    COUCHFRIENDS.showHideHowToPopup();
});

/**
 * Callback when a player connected to the game.
 *
 * @param {object} data list with the player information
 * @param {int} data.id The unique identifier of the player
 * @param {string} [data.name] The name of the player
 */
COUCHFRIENDS.on('playerJoined', function(data) {
    //console.log('Player joined. Player id: ' + data.id);
});
COUCHFRIENDS.on('_playerJoined', function(data) {
    //console.log('Player joined. Player id: ' + data.id);
    var playerName = data.id;
    if (data.name != null) {
        playerName = data.name;
    }
    COUCHFRIENDS.showNotification('Player "' + playerName + '" joined.');
    COUCHFRIENDS._connectedPlayers.push(data.id);
    COUCHFRIENDS.showHideHowToPopup();
});

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
    //console.log('Player orientation changed. Player id: ' + data.id + ' Orientation: ' + data.x + ', ' + data.y + ', ' + data.z);
});

/**
 * Callback when a player changed its name or added additional information like selected color.
 *
 * @param {object} data list with the player information
 * @param {int} data.id The unique identifier of the player
 * @param {float} [data.name] The (new) name of the player. See http://couchfriends.com/pages/profile.html for possible
 * names and characters that might be included in the name.
 */
COUCHFRIENDS.on('playerIdentify', function(data) {
    //console.log('Player orientation changed. Player id: ' + data.id + ' Orientation: ' + data.x + ', ' + data.y + ', ' + data.z);
});

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