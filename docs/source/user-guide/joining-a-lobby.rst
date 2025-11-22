Joining a lobby
===============

.. tabs::
  .. code-tab:: gdscript

      var result := await client.join_lobby("lobby-id")

  .. group-tab:: Command
    .. code::
      
      lobby/join? <lobby-id>

Get a lobby's address, to allow the player to join. The address itself is an arbitrary string.

Returns an error if the lobby doesn't exist, or if it is locked.

Note that the player can't join a lobby they've created.
