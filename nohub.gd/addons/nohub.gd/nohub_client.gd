extends RefCounted
class_name NohubClient

## Nohub client implementation
##
## This class provides access to all the functionality implemented in nohub. 
## This is done via a TCP connection. To use this client, establish a connection
## to the desired nohub server using [StreamPeerTCP], and instantiate the
## client.
## [br][br]
## Make sure to regularly poll the client using [method poll]. Otherwise, client
## calls will never return.
## [br][br]
## Every operation returns a [NohubResult]. If the operation is successful, the
## result object contains the data returned by nohub. Otherwise, the result will
## contain the error. This results in calls like this:
## [codeblock]
## var result := await nohub_client.list_lobbies()
## if result.is_success():
##     var lobbies := result.value()
##     # ...
## else:
##     push_error(result.error())
## [/codeblock]
##
## @tutorial(Getting started): https://foxssake.github.io/nohub/getting-started/using-nohub.html#with-godot
## @tutorial(Understanding nohub): https://foxssake.github.io/nohub/understanding-nohub/index.html


var _connection: StreamPeerTCP
var _reactor: TrimsockTCPClientReactor

## Construct a client using the specified [param connection]
func _init(connection: StreamPeerTCP):
	_connection = connection
	_connection.set_no_delay(true)

	_reactor = TrimsockTCPClientReactor.new(connection)


## Poll the client
## [br][br]
## This will poll the underlying connection and process any incoming commands.
func poll() -> void:
	_reactor.poll()

## Specify the game ID used by this client
## [br][br]
## See [url=https://foxssake.github.io/nohub/understanding-nohub/concepts.html#games]Games[/url].
func set_game(id: String) -> NohubResult:
	var request := TrimsockCommand.request("session/set-game") \
		.with_params([id])
	return await _bool_request(request)

## Create a lobby
func create_lobby(address: String, data: Dictionary = {}) -> NohubResult.Lobby:
	var request := TrimsockCommand.request("lobby/create") \
		.with_params([address])
	for key in data:
		request.with_kv_pairs([TrimsockCommand.pair_of(key, data[key])])

	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()

	if response.is_success():
		return NohubResult.Lobby.of_value(_command_to_lobby(response))
	else:
		return _command_to_error(response)

## Query a lobby by ID
## [br][br]
## If [param properties] is specified, only the listed properties will be
## returned from the lobby's custom data.
func get_lobby(id: String, properties: Array[String] = []) -> NohubResult.Lobby:
	var request := TrimsockCommand.request("lobby/get") \
		.with_params([id] + properties)
	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()

	if response.is_success():
		return NohubResult.Lobby.of_value(_command_to_lobby(response))
	else:
		return _command_to_error(response)

## List lobbies by ID
## [br][br]
## If [param properties] is specified, only the listed properties will be
## returned from the lobby's custom data.
func list_lobbies(properties: Array[String] = []) -> NohubResult.LobbyList:
	var result := [] as Array[NohubLobby]
	var request := TrimsockCommand.request("lobby/list") \
		.with_params(properties)

	var xchg := _reactor.submit_request(request)
	while xchg.is_open():
		var cmd := await xchg.read()

		if cmd.is_error():
			return _command_to_error(cmd)
		if not cmd.is_stream_chunk():
			continue

		result.append(_command_to_lobby(cmd))
	
	return NohubResult.LobbyList.of_value(result)

## Delete a lobby using its ID
## [br][br]
## Only the lobby's owner can delete the lobby.
func delete_lobby(lobby_id: String) -> NohubResult:
	var request := TrimsockCommand.request("lobby/delete") \
		.with_params([lobby_id])
	return await _bool_request(request)

## Join a lobby using its ID
## [br][br]
## The response will contain the lobby's address. This string can be used to
## connect.
func join_lobby(lobby_id: String) -> NohubResult.Address:
	var request := TrimsockCommand.request("lobby/join") \
		.with_params([lobby_id])

	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()
	
	if response.is_success():
		return NohubResult.Address.of_value(response.params[0])
	else:
		return _command_to_error(response)

## Lock the lobby, preventing others from joining
## [br][br]
## Only the lobby's owner can lock the lobby.
func lock_lobby(lobby_id: String) -> NohubResult:
	var request := TrimsockCommand.request("lobby/lock") \
		.with_params([lobby_id])
	return await _bool_request(request)

## Unlock the lobby, allowing others to join
## [br][br]
## Only the lobby's owner can unlock the lobby. Lobbies are unlocked by default.
func unlock_lobby(lobby_id: String) -> NohubResult:
	var request := TrimsockCommand.request("lobby/unlock") \
		.with_params([lobby_id])
	return await _bool_request(request)

## Hide lobby, making it invisible when listing lobbies
## [br][br]
## Only the lobby's owner can hide the lobby.
func hide_lobby(lobby_id: String) -> NohubResult:
	var request := TrimsockCommand.request("lobby/hide") \
		.with_params([lobby_id])
	return await _bool_request(request)

## Pulbish lobby, making it visible when listing lobbies
## [br][br]
## Only the lobby's owner can hide the lobby. Lobbies are visible by default.
func publish_lobby(lobby_id: String) -> NohubResult:
	var request := TrimsockCommand.request("lobby/publish") \
		.with_params([lobby_id])
	return await _bool_request(request)

## Set the lobby's custom data
## [br][br]
## Note that this method updates the data, instead of adding to it. Only the 
## lobby's owner can update the lobby's custom data.
func set_lobby_data(lobby_id: String, data: Dictionary) -> NohubResult:
	var request := TrimsockCommand.request("lobby/set-data") \
		.with_params([lobby_id]) \
		.with_kv_map(data)
	return await _bool_request(request)

## Return the client's address, as seen by the nohub server
## [br][br]
## This can be used to get the client's public IP address. Note that depending
## on its configuration, the server might not be able to return a useful address
## - e.g. when running from Docker using a bridge network.
func whereami() -> String:
	var request := TrimsockCommand.request("whereami")
	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()
	
	if response.is_success():
		return response.text
	else:
		return ""

func _bool_request(request: TrimsockCommand) -> NohubResult:
	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()
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

#region WebRTC

## Emitted during "webrtc/start" to kick off the peer connection
signal signal_webrtc_create_new_peer_connection(id)
## Emitted to exchange offers and answers to finish establishing connections
signal signal_webrtc_message(type, data)

## Setup the events for negotiating WebRTC connections using the signalling module
## [br][br]
## When a lobby host starts a lobby (or a peer asks for an offer, answer, or candidate):
## these events will emit signals that the clients use to initialize WebRTC peer connections
## NOTE: This function is based on the _setup_reactor example in this file:
## https://github.com/foxssake/trimsock/blob/main/trimsock.gd/examples/server/server.gd
func setup_webrtc_reactor() -> void:
	_reactor.on("webrtc/start", func(_cmd: TrimsockCommand, xchg: TrimsockExchange):
		var players = _cmd.kv_map['players'] as String
		for peer_id in players.split(',', false):
			signal_webrtc_create_new_peer_connection.emit(int(peer_id.strip_edges()))
	).on("webrtc/get/offer", func(_cmd, xchg: TrimsockExchange):
		signal_webrtc_message.emit(WEBRTC_ACTION.Offer, _cmd)
	).on("webrtc/get/answer", func(_cmd, xchg: TrimsockExchange):
		signal_webrtc_message.emit(WEBRTC_ACTION.Answer, _cmd)
	).on("webrtc/get/candidate", func(_cmd, xchg: TrimsockExchange):
		signal_webrtc_message.emit(WEBRTC_ACTION.Candidate, _cmd)
	).on_unknown(func(cmd, xchg: TrimsockExchange):
		_log("[srv] Unknown command: %s" % cmd)
		return TrimsockCommand.error_from(cmd, "error", ["Unknown command", cmd.name])
	)

func _log(what: String) -> void:
	prints(what)

## Start lobby, kicking off joining
## [br][br]
## Only the lobby's owner can start the lobby. 
func start_lobby(lobby_id: String) -> NohubResult.LobbyMessage:
	var request := TrimsockCommand.request("webrtc/lobby/start") \
		.with_params([lobby_id])

	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()

	if response.is_success():
		return NohubResult.LobbyMessage.of_value(response.params[0])
	else:
		return _command_to_error(response)

## Leave the lobby
## [br][br]
func leave_lobby(lobby_id: String) -> NohubResult.LobbyMessage:
	var request := TrimsockCommand.request("lobby/leave") \
		.with_params([lobby_id])

	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()

	if response.is_success():
		return NohubResult.LobbyMessage.of_value(response.params[0])
	else:
		return _command_to_error(response)

func get_session() -> String:
	var request := TrimsockCommand.request("getid")
	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()
	if response.is_success():
		return response.text
	else:
		return ""

enum WEBRTC_ACTION {
	Offer,
	Answer,
	Candidate
}

func send_webrtc_message(type: WEBRTC_ACTION, id: String, data: Dictionary = {}) -> NohubResult:
	var request

	match type:
		WEBRTC_ACTION.Offer:
			request = TrimsockCommand.request("webrtc/offer").with_params([id])
		WEBRTC_ACTION.Answer:
			request = TrimsockCommand.request("webrtc/answer").with_params([id])
		WEBRTC_ACTION.Candidate:
			request = TrimsockCommand.request("webrtc/candidate").with_params([id])

	request.with_kv_map(data)

	var xchg := _reactor.submit_request(request)
	var response := await xchg.read()

	if response.is_success():
		return NohubResult.LobbyMessage.of_value('send success')
	else:
		return _command_to_error(response)

#endregion
