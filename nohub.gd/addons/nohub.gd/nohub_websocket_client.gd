extends NohubClient
class_name NohubWebSocketClient

## WebSocket-based Nohub client implementation
##
## This class provides access to all nohub functionality via a WebSocket connection.
## This is particularly useful for Godot web exports that cannot create TCP connections.
## The WebSocket client connects to a WebSocket proxy service that bridges to the nohub TCP server.
## [br][br]
## Make sure to regularly poll the client using [method poll]. Otherwise, client
## calls will never return.
## [br][br]
## Every operation returns a [NohubResult]. If the operation is successful, the
## result object contains the data returned by nohub. Otherwise, the result will
## contain the error.
## [codeblock]
## var client := NohubWebSocketClient.new()
## await client.connect_to("ws://localhost:9982/ws")
## 
## var result := await client.list_lobbies()
## if result.is_success():
##     var lobbies := result.value()
##     # ...
## else:
##     push_error(result.error())
## [/codeblock]
##
## @tutorial(Getting started): https://foxssake.github.io/nohub/getting-started/using-nohub.html#with-godot
## @tutorial(Understanding nohub): https://foxssake.github.io/nohub/understanding-nohub/concepts.html

var _socket: WebSocketPeer
var _is_connected: bool = false

func _init():
	_socket = WebSocketPeer.new()
	_reactor = TrimsockWSClientReactor.new(_socket)

## Connect to the nohub WebSocket proxy server
## [br][br]
## [param url] should be in the format "ws://hostname:port/path" or "wss://..." for secure connections.
## The default nohub WebSocket proxy listens on port 9982 with path "/ws".
func connect_to(url: String) -> NohubResult:
	var error := _socket.connect_to_url(url)
	if error != OK:
		return NohubResult.of_error("ConnectionError", "Failed to connect to WebSocket: " + str(error))
	
	var timeout := Time.get_ticks_msec() + 5000  # 5 second timeout
	while _socket.get_ready_state() == WebSocketPeer.STATE_CONNECTING:
		_socket.poll()
		await Engine.get_main_loop().process_frame
		if Time.get_ticks_msec() > timeout:
			return NohubResult.of_error("ConnectionTimeout", "Connection timed out")
	
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return NohubResult.of_error("ConnectionFailed", "Failed to establish WebSocket connection")
	
	_is_connected = true
	return NohubResult.of_success()

func is_connected_to_server() -> bool:
	return _is_connected and _socket.get_ready_state() == WebSocketPeer.STATE_OPEN

func disconnect_from_server() -> void:
	if _socket:
		_socket.close()
	_is_connected = false

func poll() -> void:
	if _socket:
		_socket.poll()
		if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
			_is_connected = false
		_reactor.poll()

func _is_ready() -> bool:
	return is_connected_to_server()
