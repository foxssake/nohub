extends RefCounted
class_name NohubClient


var _connection: StreamPeerTCP
var _reactor: TrimsockTCPServerReactor
var _xid: int = 0


func _init(connection: StreamPeerTCP):
	_connection = connection
	_connection.set_no_delay(true)

	# TODO(trimsock): Reactor for TCP client
	_reactor = TrimsockTCPServerReactor.new(TCPServer.new())
	_reactor.attach(connection)

func poll() -> void:
	_reactor.poll()

func create_lobby(address: String, data: Dictionary) -> String:
	var request := TrimsockCommand.request("lobby/create", _xchg_id())\
		.with_params([address])
	for key in data:
		request.with_kv_pairs([TrimsockCommand.pair_of(key, data[key])])

	# TODO(trimsock): Return exchange
	# TODO(trimsock): Reactor.request() to autofill exchange ID
	var xchg := _reactor.send(_connection, request)
	var response := await xchg.read()
	
	if response.is_success():
		return response.text
	else:
		return ""

func list_lobbies(fields: Array[String] = []) -> Array[String]:
	var result := [] as Array[String]
	var request := TrimsockCommand.request("lobby/list", _xchg_id())\
		.with_params(fields)

	var xchg := _reactor.send(_connection, request)
	while xchg.is_open():
		var cmd := await xchg.read()
		if not cmd.is_stream_chunk():
			continue
		result.append(cmd.params[0]) # TODO: Parse keywords and fields
	
	return result

func join_lobby(id: String) -> String:
	var request := TrimsockCommand.request("lobby/join", _xchg_id())\
		.with_params([id])

	var xchg := _reactor.send(_connection, request)
	var response := await xchg.read()
	
	if response.is_success():
		return response.text
	return ""


func _xchg_id() -> String:
	_xid += 1
	return "%x" % _xid
