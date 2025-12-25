extends RefCounted
class_name NohubResult

## Represents the result of a [NohubClient] call
##
## If the call was successful, this instance will store the resulting
## value, and [method is_success] will return [code]true[/code]. This class has
## multiple specializations, each implementing a [code]value()[/code] method
## that returns a type-safe success result.
## [br][br]
## If the call failed, [method is_success] will return [code]false[/code]. The
## actual error is returned by [method error].

## Represents an error as returned by nohub
class ErrorData:
	## The error's name
	## [br][br]
	## This indicates the error type. Can be checked programmatically to
	## intelligently try and recover from an error.
	var name: String

	## The error message
	## [br][br]
	## This gives a further description of the error itself. Should not be
	## relied on, error messages may change between releases without notice.
	## However, they can be useful to convey the issue to the user.
	var message: String

	func _init(p_name: String, p_message: String):
		name = p_name
		message = p_message

	func _to_string() -> String:
		return "%s: %s" % [name, message]

## Stores a [NohubLobby] on success
##
## See [NohubResult] for details.
class Lobby extends NohubResult:
	## Construct a successful result object with the given [param value]
	static func of_value(value: NohubLobby) -> Lobby:
		var result := Lobby.new()
		result._is_success = true
		result._value = value
		return result

	## Get the resulting lobby
	func value() -> NohubLobby:
		if _is_success:
			return _value as NohubLobby
		else:
			return null

## Stores a list of [NohubLobby] instances on success
##
## See [NohubResult] for details.
class LobbyList extends NohubResult:
	## Construct a successful result object with the given [param value]
	static func of_value(value: Array[NohubLobby]) -> LobbyList:
		var result := LobbyList.new()
		result._is_success = true
		result._value = value
		return result

	## Get the resulting lobby list
	func value() -> Array[NohubLobby]:
		if _is_success:
			return _value as Array[NohubLobby]
		else:
			return []

## Stores a LobbyMessage on success
##
## See [NohubResult] for details.
class LobbyMessage extends NohubResult:
	## Construct a successful result object with the given [param value]
	static func of_value(value: String) -> LobbyMessage:
		var result := LobbyMessage.new()
		result._is_success = true
		result._value = value
		return result

	## Get the resulting string
	func value() -> String:
		if _is_success:
			return _value as String
		else:
			return ""

## Stores an address string on success
##
## See [NohubResult] for details.
class Address extends NohubResult:
	## Construct a successful result object with the given [param value]
	static func of_value(value: String) -> Address:
		var result := Address.new()
		result._is_success = true
		result._value = value
		return result

	## Get the resulting address
	func value() -> String:
		if _is_success:
			return _value as String
		else:
			return ""

var _is_success: bool
var _value: Variant
var _error: ErrorData


## Construct an error result
static func of_error(error: String, message: String) -> NohubResult:
	var result := NohubResult.new()
	result._is_success = false
	result._error = ErrorData.new(error, message)
	return result

## Construct a successful result without any value
static func of_success() -> NohubResult:
	var result := NohubResult.new()
	result._is_success = true
	return result


## Return true if the operation was successful
func is_success() -> bool:
	return _is_success

## Return the error, or [code]null[/code] if the operation was successful
func error() -> ErrorData:
	if _is_success:
		return null
	else:
		return _error

func _to_string() -> String:
	if _is_success:
		return str(_value)
	else:
		return str(_error)
