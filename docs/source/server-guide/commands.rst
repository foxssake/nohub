Command reference
=================

This page documents the commands supported by *nohub*.

For command specifications, ``>>`` denotes a line sent by the client, and
``<<`` marks a line sent by the server.

Parameters can be required, e.g. ``<address>``, or optional, e.g.
``[properties]``. This convention also applies to responses.

.. seealso::
   See `trimsock`_ on the specifics of the protocol used by *nohub*.

.. _`trimsock`: https://github.com/foxssake/trimsock

Lobby commands
--------------

.. seealso::
  See :ref:`Concepts/Lobbies` to learn more.


``lobby/create``
^^^^^^^^^^^^^^^^

.. code::

   >> lobby/create? <address> [[key1]=[value1] [key2]=[value2] ...]
   << . <lobby id>

Creates a lobby with the (optionally) specified custom data.

Parameters
++++++++++

`address` - string
    The lobby's join address

`custom data` - key-value pairs, *optional*
    Specified as key-value pairs, gets attached to the lobby on creation

Responses
+++++++++

Success
    The lobby is created, and the response contains its ID

Example
+++++++

.. code::
   
  >> lobby/create? enet://32.14.206.241:49756
  << . 9mZJpr_F

``lobby/get``
^^^^^^^^^^^^^

.. code::

  >> lobby/get? <lobby id>
  << . <lobby id> [locked] [hidden] [[key1]=[value1] ...]

Query lobby by ID.

Parameters
++++++++++

`lobby id` - string
    The lobby's ID

Responses
+++++++++

Success
    The lobby is found, and the response contains its data. The response
    contains the ``locked`` flag if the lobby is locked. The response contains
    the ``hidden`` flag if the lobby is hidden.

DataNotFoundError
    The lobby does not exist, or is not accessible to the client. This can
    also occur if the lobby exists, but belongs to a different game than the
    client's session.

Example
+++++++

.. code::

  >> lobby/get? 9mZJpr_F
  << . 9mZJpr_F locked

``lobby/delete``
^^^^^^^^^^^^^^^^

.. code::

  >> lobby/delete? <lobby id>
  << . ok

Delete a lobby.

Only the lobby's owner can delete the lobby.

Parameters
++++++++++

`lobby id` - string
    The lobby's ID

Responses
+++++++++

Success
    The lobby no longer exists. This command will also be successful even if
    the lobby didn't exist before it was requested.

UnauthorizedError
    The client is not allowed to delete the lobby.

Example
+++++++

.. code::

  >> lobby/delete? 9mZJpr_F
  << . ok

``lobby/list``
^^^^^^^^^^^^^^

.. code::

  >> lobby/list? [properties...]
  << | <lobby id> [locked] [hidden] [custom data]

List all available lobbies.

Optionally, a list of properties can be passed. If so, only those properties
will be returned from each lobby's custom data.

Parameters
++++++++++

`properties` - string, list, *optional*
    A list of properties to use for filtering each lobby's custom data. All
    custom data is returned if this list is not specified.

Responses
+++++++++

Success
    A stream of lobbies, each chunk containing a lobby. The chunk will include
    the ``locked`` flag if the lobby is locked. The chunk will include the
    ``hidden`` flag if the lobby is hidden.

Example
+++++++

.. code::

  >> lobby/list? name
  << | Mty9XqEg name="Cool Lobby"
  << | yBo9M2P1 locked name="Dave's Lobby"
  << | kDosV-CK name="Friday Night Fighters"
  << |

``lobby/join``
^^^^^^^^^^^^^^

.. code::

  >> lobby/join? <lobby id>
  << . <address>

Join a lobby.

Parameters
++++++++++

`lobby id` - string
    The lobby's ID

Responses
+++++++++

Success
    The lobby is found, and the client may join. The response contains the
    lobby's address where the client can connect.

DataNotFoundError
    The lobby does not exist, or is not accessible to the client. This can
    also occur if the lobby exists, but belongs to a different game than the
    client's session.

LockedError
    The client can't join the lobby. This can occur if the lobby is locked, or
    if the client is trying to join its own lobby.

Example
+++++++

.. code::

  >> lobby/join? kDosV-CK
  << . enet://155.78.215.134:43289

``lobby/set-data``
^^^^^^^^^^^^^^^^^^

.. code::

  >> lobby/set-data? <lobby id> [custom data]
  << . ok

Update the lobby's custom data.

Note that this completely replaces the lobby's custom data, instead of merging
the existing data with what is sent.

Only the lobby's owner can modify the lobby's custom data.

Parameters
++++++++++

`lobby id` - string
    The lobby's ID

`custom data` - key-value pairs, *optional*
    Specified as key-value pairs, gets attached to the lobby on creation

Responses
+++++++++

Success
    The lobby was found and its custom data was replaced.

DataNotFoundError
    The lobby does not exist, or is not accessible to the client. This can
    also occur if the lobby exists, but belongs to a different game than the
    client's session.

UnauthorizedError
    The client is not allowed to modify the lobby.

Example
+++++++

.. code::

  >> lobby/set-data? Mty9XqEg name="Cool Lobby" player-count=9
  << . ok

``lobby/lock``
^^^^^^^^^^^^^^

.. code::

  >> lobby/lock? <lobby id>
  << . ok

Lock a lobby.

Only the lobby's owner can lock the lobby.

Parameters
++++++++++

`lobby id` - string
    The lobby's ID

Responses
+++++++++

Success
    The lobby was found and it is now locked.

DataNotFoundError
    The lobby does not exist, or is not accessible to the client. This can
    also occur if the lobby exists, but belongs to a different game than the
    client's session.

UnauthorizedError
    The client is not allowed to modify the lobby.

Example
+++++++

.. code::

  >> lobby/lock? Mty9XqEg
  << . ok
  >> lobby/get? Mty9XqEg
  << . Mty9XqEg locked

``lobby/unlock``
^^^^^^^^^^^^^^^^

.. code::

  >> lobby/unlock? <lobby id>
  << . ok

Unlock a lobby.

Only the lobby's owner can unlock the lobby.

Parameters
++++++++++

`lobby id` - string
    The lobby's ID

Responses
+++++++++

Success
    The lobby was found and it is now unlocked.

DataNotFoundError
    The lobby does not exist, or is not accessible to the client. This can
    also occur if the lobby exists, but belongs to a different game than the
    client's session.

UnauthorizedError
    The client is not allowed to modify the lobby.

Example
+++++++

.. code::

  >> lobby/unlock? Mty9XqEg
  << . ok
  >> lobby/get? Mty9XqEg
  << . Mty9XqEg

``lobby/hide``
^^^^^^^^^^^^^^

.. code::

  >> lobby/hide? <lobby id>
  << . ok

Hide a lobby.

Only the lobby's owner can hide the lobby.

Parameters
++++++++++

`lobby id` - string
    The lobby's ID

Responses
+++++++++

Success
    The lobby was found and it is now hidden.

DataNotFoundError
    The lobby does not exist, or is not accessible to the client. This can
    also occur if the lobby exists, but belongs to a different game than the
    client's session.

UnauthorizedError
    The client is not allowed to modify the lobby.

Example
+++++++

.. code::

  >> lobby/hide? Mty9XqEg
  << . ok
  >> lobby/get? Mty9XqEg
  << . Mty9XqEg hidden

``lobby/publish``
^^^^^^^^^^^^^^^^^

.. code::

  >> lobby/publish? <lobby id>
  << . ok

Publish a lobby.

Only the lobby's owner can publish the lobby.

Parameters
++++++++++

`lobby id` - string
    The lobby's ID

Responses
+++++++++

Success
    The lobby was found and it is now published.

DataNotFoundError
    The lobby does not exist, or is not accessible to the client. This can
    also occur if the lobby exists, but belongs to a different game than the
    client's session.

UnauthorizedError
    The client is not allowed to modify the lobby.

Example
+++++++

.. code::

  >> lobby/publish? Mty9XqEg
  << . ok
  >> lobby/get? Mty9XqEg
  << . Mty9XqEg

Session commands
----------------

.. seealso::
  See :ref:`Concepts/Sessions` to learn more.

``session/set-game``
^^^^^^^^^^^^^^^^^^^^

.. code::

    >> session/set-game? <lobby id> <game id>
    << . ok

Set the current session's game.

Parameters
++++++++++

`lobby id` - string
    The lobby's ID

`game id` - string
    The game's ID

Responses
+++++++++

Success
    The session now belongs to the specified game. If
    :term:`NOHUB_SESSIONS_ARBITRARY_GAME_ID` is enabled, the specified game
    does not need to be known by *nohub*.

LockedError
    The session's game can't be changed. Either because it already belongs to a
    game, or because it has active lobbies.

DataNotFoundError
    The game was not found. This error does not occur if
    :term:`NOHUB_SESSIONS_ARBITRARY_GAME_ID` is enabled.

``whereami``
^^^^^^^^^^^^

.. code::

  >> whereami?
  << . <address>

.. code::

   >> whereami
   << youarehere <address>

Return the client's address, as seen by *nohub*.

This may be useful for getting the client's public address to use as lobby
address. Note that depending on how the server is setup, this may not be useful
- e.g. if *nohub* is running from Docker, with the bridge networking mode.

Parameters
++++++++++

None

Responses
+++++++++

Success
    The client's address, as seen by *nohub*.

Example
^^^^^^^

.. code::

   >> whereami?
   << . 253.79.132.227

