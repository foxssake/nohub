extends RefCounted
class_name NohubLobby

## Describes a lobby
##
## @tutorial(Lobbies): https://foxssake.github.io/nohub/understanding-nohub/concepts.html#lobbies


## The lobby's ID - an arbitrary string unique to it
var id: String = ""

## True if the lobby is visible
## [br][br]
## If this is false, the lobby won't appear when listing lobbies.
var is_visible: bool = true

## True if the lobby is locked
## [br][br]
## When a lobby is locked, other player's won't be able to join.
var is_locked: bool = false

## Custom data associated with the lobby
## [br][br]
## Note that all keys and values must be strings!
var data: Dictionary = {}


func _to_string() -> String:
	return "NohubLobby(id=%s, is_visible=%s, is_locked=%s, data=%s)" % [id, is_visible, is_locked, data]
