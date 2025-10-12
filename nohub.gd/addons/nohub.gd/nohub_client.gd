extends RefCounted
class_name NohubClient


var _connection: Variant
var _reactor: TrimsockReactor


static func from_tcp(connection: StreamPeerTCP) -> NohubClient:
	var reactor := TrimsockTCPClientReactor.new(connection)
	connection.set_no_delay(true)

	return NohubClient.new(connection, reactor)


func _init(connection: Variant, reactor: TrimsockReactor):
	_connection = connection
	_reactor = reactor

func poll() -> void:
	_reactor.poll()

func create_lobby(address: String, data: Dictionary) -> String:
	var request := TrimsockCommand.request("lobby/create")\
		.with_params([address])
	for key in data:
		request.with_kv_pairs([TrimsockCommand.pair_of(key, data[key])])

	var xchg := _reactor.request(_connection, request)
	var response := await xchg.read()
	
	if response.is_success():
		return response.text
	else:
		return ""
