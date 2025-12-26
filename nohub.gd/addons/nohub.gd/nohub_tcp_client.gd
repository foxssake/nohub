extends NohubClient
class_name NohubTCPClient

## Nohub TCP client implementation
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

## Construct a client using the specified [param connection]
func _init(connection: StreamPeerTCP):
	_connection = connection
	_connection.set_no_delay(true)
	_reactor = TrimsockTCPClientReactor.new(connection)

## Poll the client
func poll() -> void:
	_reactor.poll()

## Override base class method - TCP client is always "ready" if connection exists
func _is_ready() -> bool:
	return _connection != null
