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

func set_game(id: String) -> bool:
	var request := TrimsockCommand.request("session/set-game")\
		.with_params([id])
	return await _bool_request(request)

func create_lobby(address: String, data: Dictionary) -> NohubLobby:
	var request := TrimsockCommand.request("lobby/create")\
		.with_params([address])
	for key in data:
		request.with_kv_pairs([TrimsockCommand.pair_of(key, data[key])])

	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()

	if response.is_success():
		return _command_to_lobby(response)
	else:
		return null

func get_lobby(id: String, properties: Array[String] = []) -> NohubLobby:
	var request := TrimsockCommand.request("lobby/get")\
		.with_params([id] + properties)
	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()

	if response.is_success():
		return _command_to_lobby(response)
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

		result.append(_command_to_lobby(cmd))
	
	return result

func delete_lobby(lobby_id: String) -> bool:
	var request := TrimsockCommand.request("lobby/delete")\
		.with_params([lobby_id])
	return await _bool_request(request)

func join_lobby(lobby_id: String) -> String:
	var request := TrimsockCommand.request("lobby/join")\
		.with_params([lobby_id])

	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()
	
	if response.is_success():
		return response.params[0]
	else:
		return ""

func lock_lobby(lobby_id: String) -> bool:
	var request := TrimsockCommand.request("lobby/lock")\
		.with_params([lobby_id])
	return await _bool_request(request)

func unlock_lobby(lobby_id: String) -> bool:
	var request := TrimsockCommand.request("lobby/unlock")\
		.with_params([lobby_id])
	return await _bool_request(request)

func hide_lobby(lobby_id: String) -> bool:
	var request := TrimsockCommand.request("lobby/hide")\
		.with_params([lobby_id])
	return await _bool_request(request)

func publish_lobby(lobby_id: String) -> bool:
	var request := TrimsockCommand.request("lobby/publish")\
		.with_params([lobby_id])
	return await _bool_request(request)

func set_lobby_data(lobby_id: String, data: Dictionary) -> bool:
	var request := TrimsockCommand.request("lobby/set-data")\
		.with_params([lobby_id])\
		.with_kv_map(data)
	return await _bool_request(request)

func whereami() -> String:
	var request := TrimsockCommand.request("whereami")
	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()
	
	if response.is_success():
		return response.text
	else:
		return ""

func _bool_request(request: TrimsockCommand) -> bool:
	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()
	return response.is_success()

func _command_to_lobby(command: TrimsockCommand) -> NohubLobby:
	var lobby := NohubLobby.new()
	lobby.id = command.params[0]
	lobby.is_locked = command.params.find("locked", 1) >= 0
	lobby.is_visible = command.params.find("hidden", 1) < 0
	lobby.data = command.kv_map

	return lobby
