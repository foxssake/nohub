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

func create_lobby(address: String, data: Dictionary) -> NohubLobby:
	var request := TrimsockCommand.request("lobby/create")\
		.with_params([address])
	for key in data:
		request.with_kv_pairs([TrimsockCommand.pair_of(key, data[key])])

	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()
	
	if response.is_success():
		var lobby := NohubLobby.new()
		lobby.id = response.text
		lobby.data = data
		return lobby
	else:
		return null

func list_lobbies(fields: Array[String] = []) -> Array[NohubLobby]:
	var result := [] as Array[NohubLobby]
	var request := TrimsockCommand.request("lobby/list")\
		.with_params(fields)

	var xchg := _reactor.submit_request(request)
	while xchg.is_open():
		var cmd := await xchg.read()
		if not cmd.is_stream_chunk():
			continue

		var lobby := NohubLobby.new()
		lobby.id = cmd.params[0]
		lobby.is_locked = cmd.params.has("locked")
		lobby.is_visible = not cmd.params.has("hidden")
		lobby.data = cmd.kv_map

		result.append(lobby)
	
	return result

func join_lobby(lobby_id: String) -> String:
	var request := TrimsockCommand.request("lobby/join")\
		.with_params([lobby_id])

	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()
	
	if response.is_success():
		return response.params[0]
	else:
		return ""
