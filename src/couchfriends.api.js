"use strict";
/**
 * Couchfriends controller api. With the Couchfriends Controller API you can connect your phone or tablet to your HTML5
 * game and use it as a controller. The Controller API uses WebRTC (peer2peer) to send and receive input.
 *
 * @copyright (c) 2015 Mathieu de Ruiter, Couchfriends, Fellicht & Editors
 * @author Mathieu de Ruiter / http://www.fellicht.nl/
 *
 * For detailed information about the development with the Couchfriends API please visit https://couchfriends.com.
 * Please do not remove the header of this file.
 */

var COUCHFRIENDS = {
    REVISION: '4',
    /**
     * Array with sounds
     * @author http://opengameart.org/users/draconx
     */
    _sounds: {
        achievement: {
            play: function () {
                return false;
            }, // In case the file can't be loaded
            file: 'achievement.wav'
        },
        notification: {
            play: function () {
                return false;
            }, // In case the file can't be loaded
            file: 'notification.wav'
        }
    },
    /**
     * Url/path to assets
     */
    _baseUrl: 'https://couchfriends.com/cdn/api/assets/',
    /**
     * All connected players with their id, connection object, name
     */
    players: [],
    /**
     * The game code to join this game.
     */
    _code: '',
    socket: {}, // The Websocket object
    gameCode: '',
    // Object with current information and state over the game
    status: {
        connected: false
    }
    ,
    /**
     * Global settings for COUCHFRIENDS api
     * @type {object} settings list of settings
     */
    settings: {
        /**
         * The current color index.
         */
        colorIndex: 0,
        /**
         * Available player colors.
         */
        colors: [
            '#ff0000',
            '#00ff00',
            '#0000ff',
            '#ffff00',
            '#ff00ff',
            '#00ffff',
            '#ff9900',
            '#6d00ff',
            '#810000',
            '#008100',
            '#000081',
            '#818100',
            '#810081',
            '#008181',
            '#814c00',
            '#370081',
            '#ff7d7d',
            '#7dff7d',
            '#7d7dff',
            '#ffff7d',
            '#ff7dff',
            '#7dffff',
            '#ffcf8b',
            '#a983ff'
        ],
        /**
         * Enable SSL?
         */
        secure: true,
        /**
         * Websocket server
         */
        host: 'ws.couchfriends.com',
        /**
         * Websocket port
         */
        port: 80,
        /**
         * UI Settings
         */
        ui: {
            displayCode: true, // Show the code to join
            showNotifications: true,
            sound: true
        }
    }
};

/**
 * Init some javascript and styles to the game for dynamic overviews
 */
COUCHFRIENDS.init = function () {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = COUCHFRIENDS._baseUrl + 'couchfriends.ui.css';
    link.media = 'all';
    head.appendChild(link);
    var containerDiv = document.createElement("div");
    containerDiv.id = 'COUCHFRIENDS-overlay';
    containerDiv.innerHTML = '<div id="COUCHFRIENDS-popup"></div><div id="COUCHFRIENDS-notifications"></div>';
    document.body.appendChild(containerDiv);
    COUCHFRIENDS._loadAudio();
    COUCHFRIENDS.connect();
};

document.addEventListener('DOMContentLoaded', COUCHFRIENDS.init, false);

/**
 * Load all audio files
 * @private
 */
COUCHFRIENDS._loadAudio = function () {

    if (COUCHFRIENDS.settings.ui.sound == false) {
        return false;
    }
    if (typeof AudioContext != 'function') {
        return false;
    }

    for (var key in COUCHFRIENDS._sounds) {
        if (!COUCHFRIENDS._sounds.hasOwnProperty(key)) {
            continue;
        }
        var sound = COUCHFRIENDS._sounds[key];
        var request = new XMLHttpRequest();
        request.open('GET', COUCHFRIENDS._baseUrl + sound.file, true);
        request.responseType = 'arraybuffer';
        request.key = key;
        request.onload = function () {
            var context = new AudioContext();
            context.key = this.key;
            context.decodeAudioData(this.response, function (buffer) {
                COUCHFRIENDS._sounds[context.key].play = function () {
                    var source = context.createBufferSource();
                    source.buffer = buffer;
                    source.connect(context.destination);
                    if (!source.start)
                        source.start = source.noteOn;
                    source.start(0);
                }
            });
        };
        request.send();
    }
};

/**
 * Show notification and remove it after a short delay
 * @param message
 * @param duration the duration in ms
 * @param options object List with options
 * @param options.type string Type of the notification. Options: 'default', 'error', 'achievement'
 * @param options.sound boolean Play the default notification sound.
 */
COUCHFRIENDS.showNotification = function (message, duration, options) {
    options = options || {};
    if (COUCHFRIENDS.settings.ui.showNotifications == false) {
        return;
    }
    var defaultOptions = {
        type: 'default',
        sound: true
    };
    options = Object.assign(defaultOptions, options);
    duration = duration || 3500;
    if (COUCHFRIENDS.settings.ui.sound && options.sound) {
        COUCHFRIENDS._sounds.notification.play();
    }
    var id = Date.now();
    var notificationEl = document.createElement("div");
    notificationEl.className = 'COUCHFRIENDS-notification COUCHFRIENDS-notification-' + options.type;
    notificationEl.id = 'COUCHFRIENDS-' + id;
    notificationEl.innerHTML = '<p>' + message + '</p>';
    document.getElementById('COUCHFRIENDS-notifications').appendChild(notificationEl);
    setTimeout(function () {
        document.getElementById('COUCHFRIENDS-' + id).className = 'COUCHFRIENDS-notification COUCHFRIENDS-notification-' + options.type + ' COUCHFRIENDS-notification-close';
        setTimeout(function () {
            var node = document.getElementById('COUCHFRIENDS-' + id);
            if (node.parentNode) {
                node.parentNode.removeChild(node);
            }
        }, 1000);
    }, duration);
};

COUCHFRIENDS.showHideHowToPopup = function () {
    if (COUCHFRIENDS.settings.displayCode == false) {
        document.getElementById('COUCHFRIENDS-popup').style.display = 'none';
        return;
    }
    if (COUCHFRIENDS.players.length > 0 || COUCHFRIENDS._code == '') {
        if (document.getElementById('COUCHFRIENDS-popup').offsetParent === null) {
            return;
        }
        document.getElementById('COUCHFRIENDS-popup').className = 'COUCHFRIENDS-moveBottomLeft';
        return;
    }
    var message = '<img style="position:relative;top:4px;margin-right:5px;" src="' + COUCHFRIENDS._baseUrl + 'controller-mode.png" /> Go to <strong class="COUCHFRIENDS-underline">couchfriends.com</strong> with your <strong>phone</strong> or <strong>tablet</strong> and enter the code <strong id="COUCHFRIENDS-code">' + COUCHFRIENDS._code + '</strong>';
    document.getElementById('COUCHFRIENDS-popup').innerHTML = message;
    if (document.getElementById('COUCHFRIENDS-popup').offsetParent !== null) {
        document.getElementById('COUCHFRIENDS-popup').className = 'COUCHFRIENDS-moveCenter';
    }
};

/**
 * Generate a "random" color for the player. This is handy for creating
 * unique player indications. The color is sent back to the controller.
 * @returns {string}
 * @private
 */
COUCHFRIENDS._generateColor = function () {
    var color = "#" + ((1 << 24) * Math.random() | 0).toString(16);
    var colorIndex = COUCHFRIENDS.settings.colorIndex;
    if (COUCHFRIENDS.settings.colors[colorIndex] != null) {
        color = COUCHFRIENDS.settings.colors[colorIndex];
        colorIndex++;
    }
    else {
        colorIndex = 0;
        color = COUCHFRIENDS.settings.colors[colorIndex];
        colorIndex++;
    }
    COUCHFRIENDS.settings.colorIndex = colorIndex;
    return color;
};

/**
 * Generate a code. Code should always be in capitals. Controller will uppercase all chars.
 * @param len
 * @returns {string}
 * @private
 */
COUCHFRIENDS._generateCode = function (len) {
    len = len || 3;
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Caps only
    for (var i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

/**
 * Connect function. This will connect the game to the websocket server.
 *
 * @returns {void|boolean} false on error or return void. See the .on('connect', function() { }) callback for more info.
 */
COUCHFRIENDS.connect = function () {

    if (typeof WebSocket == 'undefined') {
        COUCHFRIENDS.emit('error', 'Websockets are not supported by device.');
        return false;
    }
    if (COUCHFRIENDS.settings.host == '' || COUCHFRIENDS.settings.port == '') {
        COUCHFRIENDS.emit('error', 'Host or port is empty.');
        return false;
    }
    if (COUCHFRIENDS._socket != null && COUCHFRIENDS._socket.open == true) {
        return false;
    }
    var code = COUCHFRIENDS._generateCode();
    var peer = new Peer(code, {
        host: COUCHFRIENDS.settings.host,
        port: COUCHFRIENDS.settings.port,
        secure: COUCHFRIENDS.settings.secure
    });
    peer.on('open', function (code) {
        COUCHFRIENDS.emit('connect', code);
    });
    peer.on('close', function () {
        COUCHFRIENDS.emit('disconnect');
    });
    peer.on('connection', function (conn) {
        COUCHFRIENDS.emit('player.join', conn);
    });
    COUCHFRIENDS._socket = peer;
};

/**
 * Send data to the server/controller
 *
 * @param data Object object with data to send. See Api references for all available options.
 */
COUCHFRIENDS.send = function (data) {
    COUCHFRIENDS._socket.send(data);
};

Emitter(COUCHFRIENDS);

/**
 * Callback when an error has occurred.
 *
 * @param {object} data list with error details.
 * @param {string} data.message the error
 */
COUCHFRIENDS.on('error', function (data) {
    COUCHFRIENDS.showNotification(data, null, {
        type: 'error'
    })
});

/**
 * Callback after connection to the WebSocket server is successful. Best practise will be hosting a new game after
 * a successful connection.
 * @param string code. The code players can use to join.
 */
COUCHFRIENDS.on('connect', function (code) {
    COUCHFRIENDS._code = code;
    COUCHFRIENDS.showHideHowToPopup();
});

/**
 * Callback after the connection is lost from the WebSocket server.
 */
COUCHFRIENDS.on('disconnect', function () {
    COUCHFRIENDS.showNotification('Disconnected from server...', null, {
        type: 'error'
    });
});

/**
 * Callback when a player connected to the game.
 *
 * @param conn the peer connection to the player.
 */
COUCHFRIENDS.on('player.join', function (conn) {
    var player = {
        id: conn.peer,
        conn: conn,
        color: COUCHFRIENDS._generateColor()
    };
    conn.player = player;
    conn.on('open', function () {
        this.send({
            type: 'player.identify',
            data: {
                color: this.player.color
            }
        })
    });
    conn.on('close', function () {
        COUCHFRIENDS.emit('player.left', {
            player: this.player
        });
    });

    /**
     * Receiving data from one of the players.
     * @param data object from the controller
     * @param data.topic string The action of the player
     * player.orientation
     * player.click
     * player.clickDown
     * player.clickUp
     * player.buttonClick
     * player.buttonDown
     * player.buttonUp
     * player.identify
     *
     * @return void
     */
    conn.on('data', function (data) {
        if (data.topic == null) {
            return;
        }
        var params = {};
        if (data.data != null) {
            params = data.data;
        }
        params.player = this.player;
        COUCHFRIENDS.emit(data.topic, params);
    });
    COUCHFRIENDS.players.push(player);
    COUCHFRIENDS.showNotification('New player joined.');
    COUCHFRIENDS.showHideHowToPopup();
});

/**
 * Callback when a player disconnect from the game.
 *
 * @param {object} data list with the player information
 * @param {int} data.player the player object
 */
COUCHFRIENDS.on('playerLeft', function (data) {
    COUCHFRIENDS.players.splice(COUCHFRIENDS.players.indexOf(data.player), 1);
    COUCHFRIENDS.showNotification('Player left.');
    COUCHFRIENDS.showHideHowToPopup();
});

/**
 * Callback when achievement is unlocked. Displays notification and plays
 * a achievement sound.
 * @param object data
 * data.name the name of the achievement
 * data.image the url of the icon of the achievement
 */
COUCHFRIENDS.on('achievementUnlock', function (data) {
    COUCHFRIENDS._sounds.achievement.play();
    var html = '';
    if (data.image != null) {
        html += '<img src="' + data.image + '" /> ';
    }
    html += 'Achievement unlocked: <strong>' + data.name + '</strong>';
    COUCHFRIENDS.showNotification(html, null, {
        type: 'achievement',
        sound: false
    });
});

/**
 * Callback when a player chances the orientation of his device. Useful for movement tracking.
 *
 * For performance reasons this function will only be called if the orientation has changed since the previous frame.
 *
 * @param {object} data list with the player id and orientation
 * @param {int} data.player The player object
 * @param {float} [data.orientation.x] The x-as orientation (-1 to 1). E.g. -0.871
 * @param {float} [data.orientation.y] The y-as orientation (-1 to 1). E.g. 0.12
 * @param {float} [data.orientation.z] The z-as orientation (-1 to 1). E.g. -0.301
 */
COUCHFRIENDS.on('player.orientation', function (data) {
    //console.log('Player orientation changed. Player id: ' + data.id + ' Orientation: ' + data.orientation.x + ', ' + data.orientation.y + ', ' + data.orientation.z);
});

/**
 * Callback when a player changed its name or added additional information like selected color.
 *
 * @param {object} data list with the player information
 * @param {int} data.id The unique identifier of the player
 * @param {float} [data.name] The (new) name of the player. See http://couchfriends.com/pages/profile.html for possible
 * names and characters that might be included in the name.
 */
COUCHFRIENDS.on('player.identify', function (data) {
    //console.log('Player with id: '+ data.id +' changed its name to: ' + data.name);
});

/**
 * Callback when a player tapped canvas up and down
 *
 * @param {object} data list with the player information
 * @param {int} data.id The unique identifier of the player
 * @param {float} data.x Left position clicked in percentage
 * @param {float} data.y Top position clicked in percentage
 */
COUCHFRIENDS.on('player.click', function (data) {
    //console.log('Player clicked. Player id: ' + data.id + ' Click position: ' + data.x + ', ' + data.y);
});

/**
 * Callback when a player tapped canvas up and down
 *
 * @param {object} data list with the player information
 * @param {int} data.id The unique identifier of the player
 * @param {float} data.x Left position clicked in percentage
 * @param {float} data.y Top position clicked in percentage
 */
COUCHFRIENDS.on('player.clickDown', function (data) {
    //console.log('Player clicked. Player id: ' + data.id + ' Click position: ' + data.x + ', ' + data.y);
});

/**
 * Callback when a player tapped canvas up and down
 *
 * @param {object} data list with the player information
 * @param {int} data.id The unique identifier of the player
 * @param {float} data.x Left position clicked in percentage
 * @param {float} data.y Top position clicked in percentage
 */
COUCHFRIENDS.on('player.clickUp', function (data) {
    //console.log('Player clicked. Player id: ' + data.id + ' Click position: ' + data.x + ', ' + data.y);
});

/**
 * Callback when a player tapped a button
 *
 * @param {object} data list with the player and button information
 * @param {int} data.id The unique identifier of the button
 * @param {int} data.playerId The unique identifier of the player
 */
COUCHFRIENDS.on('player.buttonClick', function (data) {
    //console.log('Player clicked a button. Player id: ' + data.playerId + ' Button id: ' + data.id);
});

/**
 * Callback when a player tapped a button
 *
 * @param {object} data list with the player and button information
 * @param {int} data.player the player object
 * @param {object} data.button Object of the button information
 * @param {string} data.button.id The Button id
 */
COUCHFRIENDS.on('player.buttonDown', function (data) {
    //console.log('Player clicked a button. Player id: ' + data.playerId + ' Button id: ' + data.button.id);
});

/**
 * Callback when a player released a button
 *
 * @param {object} data list with the player and button information
 * @param {int} data.player the player object
 * @param {object} data.button Object of the button information
 * @param {string} data.button.id The Button id
 */
COUCHFRIENDS.on('player.buttonUp', function (data) {
    //console.log('Player clicked a button. Player id: ' + data.playerId + ' Button id: ' + data.button.id);
});
