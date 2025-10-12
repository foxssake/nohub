extends RefCounted
class_name NohubClient


var _connection: StreamPeerTCP
var _reactor: TrimsockTCPClientReactor


func _init(connection: StreamPeerTCP):
	_connection = connection
	_connection.set_no_delay(true)

	_reactor = TrimsockTCPClientReactor.new(connection)

func poll() -> void:
	_reactor.poll()

func create_lobby(address: String, data: Dictionary) -> String:
	var request := TrimsockCommand.request("lobby/create")\
		.with_params([address])
	for key in data:
		request.with_kv_pairs([TrimsockCommand.pair_of(key, data[key])])

	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()
	
	if response.is_success():
		return response.text
	else:
		return ""

func list_lobbies(fields: Array[String] = []) -> Array[String]:
	var result := [] as Array[String]
	var request := TrimsockCommand.request("lobby/list")\
		.with_params(fields)

	var xchg := _reactor.submit_request(request)
	while xchg.is_open():
		var cmd := await xchg.read()
		if not cmd.is_stream_chunk():
			continue
		result.append(cmd.params[0]) # TODO: Parse keywords and fields
	
	return result

func join_lobby(id: String) -> String:
	var request := TrimsockCommand.request("lobby/join")\
		.with_params([id])

	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()
	
	if response.is_success():
		return response.text
	return ""
