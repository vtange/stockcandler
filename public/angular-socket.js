var module = angular.module('socket.io', []);

module.provider('$socket', function $socketProvider() {

	//
	var ioUrl = '';
	var ioConfig = {};
	function setOption(name, value, type) {
		if (typeof value != type) {
			throw new TypeError("'"+ name +"' must be of type '"+ type + "'");
		}

		ioConfig[name] = value;
	}

	this.setConnectionUrl = function setConnectionUrl(url) {
		if (typeof url == 'string') {
			ioUrl = url;
		} else {
			throw new TypeError('url must be of type string');
		}
	};
	this.setResource = function setResource(value) {
    setOption('resource', value, 'string');
	};
	this.setConnectTimeout = function setConnectTimeout(value) {
		setOption('connect timeout', value, 'number');
	};
	this.setTryMultipleTransports = function setTryMultipleTransports(value) {
		setOption('try multiple transports', value, 'boolean');
	};
	this.setReconnect = function setReconnect(value) {
		setOption('reconnect', value, 'boolean');
	};
	this.setReconnectionDelay = function setReconnectionDelay(value) {
		setOption('reconnection delay', value, 'number');
	};
	this.setReconnectionLimit = function setReconnectionLimit(value) {
		setOption('reconnection limit', value, 'number');
	};
	this.setMaxReconnectionAttempts = function setMaxReconnectionAttempts(value) {
		setOption('max reconnection attempts', value, 'number');
	};
	this.setSyncDisconnectOnUnload = function setSyncDisconnectOnUnload(value) {
		setOption('sync disconnect on unload', value, 'boolean');
	};
	this.setAutoConnect = function setAutoConnect(value) {
		setOption('auto connect', value, 'boolean');
	};
	this.setFlashPolicyPort = function setFlashPolicyPort(value) {
		setOption('flash policy port', value, 'number')
	};
	this.setForceNewConnection = function setForceNewConnection(value) {
		setOption('force new connection', value, 'boolean');
	};

	//factory function - creates service object for creating controllers with

	this.$get = function $socketFactory($rootScope) {
	    var socket = io(ioUrl, ioConfig);
		return {

			//used when client is ping'd with a change from another client. (from the server of course)
			//tell controller to call $scope.apply with given arguments
			on: function on(event, callback) {
				socket.on(event, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						callback.apply(socket, args);
					});
				});
			},
			
			//enable disconnect, or else memory leaks can occur if view changes without canceling watchers / listeners
			off: function off(event, callback) {
				if (typeof callback == 'function') {
					socket.removeListener(event, callback);
				}
				else {
					socket.removeAllListeners(event);
				}
			},
			
			//sends data to server
			emit: function emit(event, data, callback) {
				
				//if you want to do something special whenever you send out a ping,
				if (typeof callback == 'function') {
					socket.emit(event, data, function () {
						//do the same as you would on the 'on' method
						var args = arguments;
						$rootScope.$apply(function () {
							callback.apply(socket, args);
						});
					});
				}
				else {
					//if no special action, just send out the ping.
					socket.emit(event, data);
				}
			}
		};
	};
});