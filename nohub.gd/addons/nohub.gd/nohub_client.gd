class_name NohubClient

## Base class for nohub clients
## This class provides the common interface for nohub clients.
## Specific implementations should extend this class and implement the required methods.

var _reactor: TrimsockReactor

func _is_ready() -> bool:
	push_error("_is_ready() must be implemented by subclass")
	return false

func _get_reactor() -> TrimsockReactor:
	return _reactor

## Specify the game ID used by this client
## [br][br]
## See [url=https://foxssake.github.io/nohub/understanding-nohub/concepts.html#games]Games[/url].
func set_game(id: String) -> NohubResult:
	if not _is_ready():
		return NohubResult.of_error("NotConnected", "Client is not connected to server")
	
	var request := TrimsockCommand.request("session/set-game")\
		.with_params([id])
	return await _bool_request(request)

## Query a lobby by ID
## [br][br]
## If [param properties] is specified, only the listed properties will be
## returned from the lobby's custom data.
func create_lobby(address: String, data: Dictionary = {}) -> NohubResult.Lobby:
	if not _is_ready():
		return NohubResult.of_error("NotConnected", "Client is not connected to server")
	
	var request := TrimsockCommand.request("lobby/create")\
		.with_params([address])
	for key in data:
		request.with_kv_pairs([TrimsockCommand.pair_of(key, data[key])])

	var xchg: TrimsockExchange = _get_reactor().submit_request(request)
	var response: TrimsockCommand = await xchg.read()

	if response.is_success():
		return NohubResult.Lobby.of_value(_command_to_lobby(response))
	else:
		return _command_to_error(response)

## Query a lobby by ID
## [br][br]
## If [param properties] is specified, only the listed properties will be
## returned from the lobby's custom data.
func get_lobby(id: String, properties: Array[String] = []) -> NohubResult.Lobby:
	if not _is_ready():
		return NohubResult.of_error("NotConnected", "Client is not connected to server")
	
	var request := TrimsockCommand.request("lobby/get")\
		.with_params([id] + properties)
	var xchg: TrimsockExchange = _get_reactor().submit_request(request)
	var response: TrimsockCommand = await xchg.read()

	if response.is_success():
		return NohubResult.Lobby.of_value(_command_to_lobby(response))
	else:
		return _command_to_error(response)

## List lobbies by ID
## [br][br]
## If [param properties] is specified, only the listed properties will be
## returned from the lobby's custom data.
func list_lobbies(properties: Array[String] = []) -> NohubResult.LobbyList:
	if not _is_ready():
		return NohubResult.of_error("NotConnected", "Client is not connected to server")
	
	var result := [] as Array[NohubLobby]
	var request := TrimsockCommand.request("lobby/list")\
		.with_params(properties)

	var xchg: TrimsockExchange = _get_reactor().submit_request(request)
	while xchg.is_open():
		var cmd: TrimsockCommand = await xchg.read()

		if cmd.is_error():
			return _command_to_error(cmd)
		if not cmd.is_stream_chunk():
			continue

		result.push_back(_command_to_lobby(cmd))

	return NohubResult.LobbyList.of_value(result)

## Delete a lobby using its ID
## [br][br]
## Only the lobby's owner can delete the lobby.
func delete_lobby(lobby_id: String) -> NohubResult:
	if not _is_ready():
		return NohubResult.of_error("NotConnected", "Client is not connected to server")
	
	var request := TrimsockCommand.request("lobby/delete")\
		.with_params([lobby_id])
	return await _bool_request(request)

## Join a lobby using its ID
## [br][br]
## The response will contain the lobby's address. This string can be used to
## connect.
func join_lobby(lobby_id: String) -> NohubResult.Address:
	if not _is_ready():
		return NohubResult.of_error("NotConnected", "Client is not connected to server")
	
	var request := TrimsockCommand.request("lobby/join")\
		.with_params([lobby_id])

	var xchg: TrimsockExchange = _get_reactor().submit_request(request)
	var response: TrimsockCommand = await xchg.read()
	
	if response.is_success():
		return NohubResult.Address.of_value(response.params[0])
	else:
		return _command_to_error(response)

## Lock the lobby, preventing others from joining
## [br][br]
## Only the lobby's owner can lock the lobby.
func lock_lobby(lobby_id: String) -> NohubResult:
	if not _is_ready():
		return NohubResult.of_error("NotConnected", "Client is not connected to server")
	
	var request := TrimsockCommand.request("lobby/lock")\
		.with_params([lobby_id])
	return await _bool_request(request)

## Unlock the lobby, allowing others to join
## [br][br]
## Only the lobby's owner can unlock the lobby. Lobbies are unlocked by default.
func unlock_lobby(lobby_id: String) -> NohubResult:
	if not _is_ready():
		return NohubResult.of_error("NotConnected", "Client is not connected to server")
	
	var request := TrimsockCommand.request("lobby/unlock")\
		.with_params([lobby_id])
	return await _bool_request(request)

## Hide lobby, making it invisible when listing lobbies
## [br][br]
## Only the lobby's owner can hide the lobby.
func hide_lobby(lobby_id: String) -> NohubResult:
	if not _is_ready():
		return NohubResult.of_error("NotConnected", "Client is not connected to server")
	
	var request := TrimsockCommand.request("lobby/hide")\
		.with_params([lobby_id])
	return await _bool_request(request)

## Pulbish lobby, making it visible when listing lobbies
## [br][br]
## Only the lobby's owner can hide the lobby. Lobbies are visible by default.
func publish_lobby(lobby_id: String) -> NohubResult:
	if not _is_ready():
		return NohubResult.of_error("NotConnected", "Client is not connected to server")
	
	var request := TrimsockCommand.request("lobby/publish")\
		.with_params([lobby_id])
	return await _bool_request(request)

## Set the lobby's custom data
## [br][br]
## Note that this method updates the data, instead of adding to it. Only the 
## lobby's owner can update the lobby's custom data.
func set_lobby_data(lobby_id: String, data: Dictionary) -> NohubResult:
	if not _is_ready():
		return NohubResult.of_error("NotConnected", "Client is not connected to server")
	
	var request := TrimsockCommand.request("lobby/set-data")\
		.with_params([lobby_id])\
		.with_kv_map(data)
	return await _bool_request(request)

## Return the client's address, as seen by the nohub server
## [br][br]
## This can be used to get the client's public IP address. Note that depending
## on its configuration, the server might not be able to return a useful address
## - e.g. when running from Docker using a bridge network.
func whereami() -> String:
	if not _is_ready():
		return ""
	
	var request := TrimsockCommand.request("whereami")
	var xchg: TrimsockExchange = _get_reactor().submit_request(request)
	var response: TrimsockCommand = await xchg.read()
	
	if response.is_success():
		return response.text
	else:
		return ""

func _bool_request(request: TrimsockCommand) -> NohubResult:
	var xchg: TrimsockExchange = _get_reactor().submit_request(request)
	var response: TrimsockCommand = await xchg.read()
	if response.is_success():
		return NohubResult.of_success()
	else:
		return _command_to_error(response)

func _command_to_lobby(command: TrimsockCommand) -> NohubLobby:
	var lobby := NohubLobby.new()
	lobby.id = command.params[0]
	lobby.is_locked = command.params.find("locked", 1) >= 0
	lobby.is_visible = command.params.find("hidden", 1) < 0
	lobby.data = command.kv_map
	return lobby

func _command_to_error(command: TrimsockCommand) -> NohubResult:
	if command.is_error() and command.params.size() >= 2:
		return NohubResult.of_error(command.params[0], command.params[1])
	else:
		return NohubResult.of_error(command.name, "")