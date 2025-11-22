Creating a lobby
================

.. tabs::
  .. code-tab:: gdscript

      var result := await client.create_lobby(address, { "key1": "value1", "key2": "value2" })

  .. tab:: Command
    .. code::
      
      lobby/create? <address> [[key1]=[value1] [key2]=[value2] ...]

Creates a lobby that players can join. The lobby must have an `address`
specified, so players know where to connect.

The custom data must also be specified for the lobby upon creation. If custom
data is not needed, use an empty dictionary ( ``{}`` ).

On success, replies with the created lobby's details.

