/*! couchfriends.api 2015-06-09 */
"use strict";function Emitter(a){return a?mixin(a):void 0}function mixin(a){for(var b in Emitter.prototype)a[b]=Emitter.prototype[b];return a}Emitter.prototype.on=Emitter.prototype.addEventListener=function(a,b){return this._callbacks=this._callbacks||{},(this._callbacks["$"+a]=this._callbacks["$"+a]||[]).push(b),this},Emitter.prototype.once=function(a,b){function c(){this.off(a,c),b.apply(this,arguments)}return c.fn=b,this.on(a,c),this},Emitter.prototype.off=Emitter.prototype.removeListener=Emitter.prototype.removeAllListeners=Emitter.prototype.removeEventListener=function(a,b){if(this._callbacks=this._callbacks||{},0==arguments.length)return this._callbacks={},this;var c=this._callbacks["$"+a];if(!c)return this;if(1==arguments.length)return delete this._callbacks["$"+a],this;for(var d,e=0;e<c.length;e++)if(d=c[e],d===b||d.fn===b){c.splice(e,1);break}return this},Emitter.prototype.emit=function(a){this._callbacks=this._callbacks||{};var b=[].slice.call(arguments,1),c=this._callbacks["$"+a];if(c){c=c.slice(0);for(var d=0,e=c.length;e>d;++d)c[d].apply(this,b)}return this},Emitter.prototype.listeners=function(a){return this._callbacks=this._callbacks||{},this._callbacks["$"+a]||[]},Emitter.prototype.hasListeners=function(a){return!!this.listeners(a).length};var COUCHFRIENDS={REVISION:"3",_INIT:!1,_socket:{},_connectedPlayers:[],_gameCode:"",status:{connected:!1},settings:{apiKey:"",host:"",port:"",ui:{showNotifications:!0,showHowTo:!0}}};COUCHFRIENDS.callbacks=[],COUCHFRIENDS.callbacks["game.start"]="gameStart",COUCHFRIENDS.callbacks["player.left"]="playerLeft",COUCHFRIENDS.callbacks["player.join"]="playerJoined",COUCHFRIENDS.callbacks["player.orientation"]="playerOrientation",COUCHFRIENDS.callbacks["player.click"]="playerClick",COUCHFRIENDS.callbacks["player.identify"]="playerIdentify",COUCHFRIENDS.callbacks.error="error",COUCHFRIENDS.init=function(){COUCHFRIENDS._INIT=!0;var a=document.getElementsByTagName("head")[0],b=document.createElement("link");b.rel="stylesheet",b.type="text/css",b.href="http://cdn.couchfriends.com/js/couchfriends.ui.css",b.href="http://localhost/couchfriends-controller-api/src/couchfriends.ui.css",b.media="all",a.appendChild(b);var c=document.createElement("div");c.id="COUCHFRIENDS-overlay",c.innerHTML='<div id="COUCHFRIENDS-popup"></div><div id="COUCHFRIENDS-notifications"></div>',document.body.appendChild(c)},COUCHFRIENDS.showNotification=function(a){if(0!=COUCHFRIENDS.settings.ui.showNotifications){var b=Date.now(),c=document.createElement("div");c.className="COUCHFRIENDS-notification",c.id="COUCHFRIENDS-"+b,c.innerHTML="<p>"+a+"</p>",document.getElementById("COUCHFRIENDS-notifications").appendChild(c),setTimeout(function(){document.getElementById("COUCHFRIENDS-"+b).className="COUCHFRIENDS-notification COUCHFRIENDS-notification-close",setTimeout(function(){var a=document.getElementById("COUCHFRIENDS-"+b);a.parentNode&&a.parentNode.removeChild(a)},1e3)},3500)}},COUCHFRIENDS.showHideHowToPopup=function(){if(0==COUCHFRIENDS.settings.showHowTo)return void(document.getElementById("COUCHFRIENDS-popup").style.display="none");if(COUCHFRIENDS._connectedPlayers.length>0||""==COUCHFRIENDS._gameCode){if(null===document.getElementById("COUCHFRIENDS-popup").offsetParent)return;return void(document.getElementById("COUCHFRIENDS-popup").className="COUCHFRIENDS-fadeOut")}var a='Go to <strong class="COUCHFRIENDS-underline">www.couchfriends.com</strong> with your <strong>phone</strong> or <strong>tablet</strong> and enter the code <strong id="COUCHFRIENDS-code">'+COUCHFRIENDS._gameCode+"</strong>";document.getElementById("COUCHFRIENDS-popup").innerHTML=a,null!==document.getElementById("COUCHFRIENDS-popup").offsetParent&&(document.getElementById("COUCHFRIENDS-popup").className="COUCHFRIENDS-fadeIn")};var counter=0;COUCHFRIENDS.connect=function(){return 0==COUCHFRIENDS._INIT&&COUCHFRIENDS.init(),"undefined"==typeof WebSocket?(COUCHFRIENDS.emit("error","Websockets are not supported by device."),!1):""==COUCHFRIENDS.settings.host||""==COUCHFRIENDS.settings.port?(COUCHFRIENDS.emit("error","Host or port is empty."),!1):1==COUCHFRIENDS.status.connected?!1:(COUCHFRIENDS._socket=new WebSocket("ws://"+COUCHFRIENDS.settings.host+":"+COUCHFRIENDS.settings.port),COUCHFRIENDS._socket.onmessage=function(a){var b=JSON.parse(a.data),c="";"string"==typeof b.topic&&(c+=b.topic),"string"==typeof b.action&&(c+="."+b.action),"undefined"!=typeof COUCHFRIENDS.callbacks[c]&&(COUCHFRIENDS.emit("_"+COUCHFRIENDS.callbacks[c],b.data),COUCHFRIENDS.emit(COUCHFRIENDS.callbacks[c],b.data))},COUCHFRIENDS._socket.onopen=function(){COUCHFRIENDS.status.connected=!0,COUCHFRIENDS.emit("connect")},void(COUCHFRIENDS._socket.onclose=function(){COUCHFRIENDS.status.connected=!1,COUCHFRIENDS.emit("disconnect")}))},COUCHFRIENDS.send=function(a){return 0==COUCHFRIENDS.status.connected?(COUCHFRIENDS.emit("error","Message not send because game is not connected to server."),!1):void COUCHFRIENDS._socket.send(JSON.stringify(a))},Emitter(COUCHFRIENDS),COUCHFRIENDS.on("error",function(a){}),COUCHFRIENDS.on("connect",function(){}),COUCHFRIENDS.on("disconnect",function(){}),COUCHFRIENDS.on("_disconnect",function(){COUCHFRIENDS._gameCode=""}),COUCHFRIENDS.on("gameStart",function(a){}),COUCHFRIENDS.on("_gameStart",function(a){COUCHFRIENDS._gameCode=a.code,COUCHFRIENDS.showHideHowToPopup()}),COUCHFRIENDS.on("playerLeft",function(a){}),COUCHFRIENDS.on("_playerLeft",function(a){var b=a.id;null!=a.name&&(b=a.name),COUCHFRIENDS.showNotification('Player "'+b+'" left.'),COUCHFRIENDS._connectedPlayers.splice(COUCHFRIENDS._connectedPlayers.indexOf(a.id),1),COUCHFRIENDS.showHideHowToPopup()}),COUCHFRIENDS.on("playerJoined",function(a){}),COUCHFRIENDS.on("_playerJoined",function(a){var b=a.id;null!=a.name&&(b=a.name),COUCHFRIENDS.showNotification('Player "'+b+'" joined.'),COUCHFRIENDS._connectedPlayers.push(a.id),COUCHFRIENDS.showHideHowToPopup()}),COUCHFRIENDS.on("playerOrientation",function(a){}),COUCHFRIENDS.on("playerIdentify",function(a){}),COUCHFRIENDS.on("playerClick",function(a){});