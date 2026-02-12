extends TrimsockReactor
class_name TrimsockWSClientReactor

var _socket: WebSocketPeer

func _init(socket: WebSocketPeer):
	_socket = socket
	attach(_socket)

func submit(command: TrimsockCommand) -> TrimsockExchange:
	return send(_socket, command)

func submit_request(command: TrimsockCommand) -> TrimsockExchange:
	return request(_socket, command)

func submit_stream(command: TrimsockCommand) -> TrimsockExchange:
	return stream(_socket, command)

func _poll() -> void:
	if _socket.get_ready_state() != WebSocketPeer.STATE_OPEN:
		return

	while _socket.get_available_packet_count() > 0:
		var packet := _socket.get_packet()
		_ingest(_socket, packet)

func _write(target: Variant, command: TrimsockCommand) -> void:
	assert(target is WebSocketPeer, "Invalid target!")
	var socket := target as WebSocketPeer
	var data := command.serialize()

	if data is PackedByteArray:
		socket.send_text((data as PackedByteArray).get_string_from_utf8())
	else:
		socket.send_text(str(data))