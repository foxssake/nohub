Managing Lobbies
================

.. tip::
   To get an overview of what lobbies and their components are, see
   :doc:`/understanding-nohub/concepts`

Hide and Publish
----------------

Lobbies start out as public, meaning that everyone can see them. Lobbies can
also be hidden, so they don't show up when listing lobbies.

.. tabs::
  .. code-tab:: gdscript

      var hide_result := await client.hide_lobby("lobby-id")
      var publish_result := await client.publish_lobby("lobby-id")

  .. group-tab:: Command
    .. code::
      
      lobby/hide? <lobby-id>
      lobby/publish? <lobby-id>

Both commands reply with a success response on success, or an error if the
operation failed.

Lock and Unlock
---------------

Lobbies can be locked, to prevent other players from joining. Once a lobby is
locked, join requests will be met with an error. Locked lobbies can also be
unlocked, to allow joining once again.

.. tabs::
  .. code-tab:: gdscript

      var lock_result := await client.lock_lobby("lobby-id")
      var unlock_result := await client.unlock_lobby("lobby-id")

  .. group-tab:: Command
    .. code::
      
      lobby/lock? <lobby-id>
      lobby/unlock? <lobby-id>

Both commands reply with a success response on success, or an error if the
operation failed.

Updating the Custom Data
------------------------

Lobby custom data can be set as-is. To add or remove keys from the custom data,
we recommend keeping a local copy of the custom data, applying your
modifications, and submitting it in full.

.. tabs::
  .. code-tab:: gdscript

      var result := await client.set_lobby_data("lobby-id", { "key1": "value1", "key2": "value2" })

  .. group-tab:: Command
    .. code::
      
      lobby/set-data? <lobby-id> [[key1]=[value1] [key2]=[value2] ...]

Replies with a success response on success, or an error if the update failed.

Deleting a Lobby
----------------

Lobbies are automatically deleted when their owning session ends, e.g. the
player disconnects. Lobbies can also be manually deleted.

.. tabs::
  .. code-tab:: gdscript

      var result := await client.delete_lobby("lobby-id")

  .. group-tab:: Command
    .. code::
      
      lobby/delete? <lobby-id>

Replies with a success response. If the lobby doesn't exist, that also counts
as success.

