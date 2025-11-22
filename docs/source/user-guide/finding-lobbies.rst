Finding lobbies
===============

Listing lobbies
---------------

.. tabs::
  .. code-tab:: gdscript

      var result := await client.list_lobbies(["field1", "field2"])

  .. group-tab:: Command
    .. code::
      
      lobby/list? [[field1] [field2] ...]

Lists all public lobbies. Each lobby includes its flags ( hidden or public,
locked or unlocked ), and its custom data. If a list of fields is specified,
only those are included in the custom data. Use an empty list to return all
custom data.

If the current session has a game set, only lobbies in the same game are
listed.

The result is a list of lobbies.

Querying a single lobby
-----------------------

.. tabs::
  .. code-tab:: gdscript

      var result := await client.get_lobby("lobby-id", ["field1", "field2"])

  .. group-tab:: Command
    .. code::
      
      lobby/get? <lobby-id> [[field1] [field2] ...]

Returns a single lobby by ID. If the lobby exists, but is hidden, this command
returns it nonetheless. 

If the current session has a game set, only lobbies in the same game can be
queried.

