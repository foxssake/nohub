Configuration reference
=======================

To configure *nohub*, use environment variables, or place a ``.env`` file in
its directory.

The recognized environment variables are described below.

TCP
---

.. glossary::

  ``NOHUB_TCP_HOST``
      TCP host to listen on. This is where clients can command and send commands.
      Set to ``*`` to listen on all available interfaces, or to ``0.0.0.0`` to
      only listen over IPv4.

      Defaults to ``*``.

  ``NOHUB_TCP_PORT``
      TCP port to listen on. This is the port where clients can connect and send
      commands. Defaults to ``9980``.

  ``NOHUB_TCP_COMMAND_BUFFER_SIZE``
      Buffer size for incoming data. Any command larger than this buffer will be
      dropped. Prevents clients from sending too many or too large commands in
      one go.

      Recognizes simple numbers ( ``1024`` ), or human-readable sizes ( ``100b``,
      ``1kb``, etc. ).

WebSocket
---------

.. glossary::

  ``NOHUB_WEBSOCKET_ENABLED``
      Enable or disable the WebSocket proxy service. The WebSocket proxy allows
      web-based clients (like Godot web exports) to connect to nohub.

      Defaults to ``true``.

  ``NOHUB_WEBSOCKET_HOST``
      WebSocket host to listen on. Set to ``*`` to listen on all available
      interfaces, or to ``0.0.0.0`` to only listen over IPv4.

      Defaults to ``*``.

  ``NOHUB_WEBSOCKET_PORT``
      WebSocket port to listen on. This is where WebSocket clients can connect
      to access nohub functionality.

      Defaults to ``9982``.

  ``NOHUB_WEBSOCKET_PATH``
      WebSocket endpoint path. Clients should connect to this path on the
      WebSocket server.

      Defaults to ``/ws``.

Games
-----

.. seealso::
   See :ref:`Concepts/Games` to learn more.

.. glossary::

  ``NOHUB_GAMES``
      A list of games recognized by *nohub*. Each game should reside in its own
      line, each line containing the game's ID and its name. For example:

      .. code::

        q5jMbqNLKQSy0FxhTCHZ9 Forest Brawl
        Yf8cBD_EmJa26xRr_2hoX Campfire: Surviving Orom

      Defaults to an empty list.

.. _`Configuration/Metrics`:

Metrics
-------

.. glossary::

  ``NOHUB_METRICS_ENABLED``
      Set to ``true`` to enable metrics.

      Defaults to ``true``.

  ``NOHUB_METRICS_HOST``
      Metrics are served over HTTP. This setting controls which interfaces to
      listen on for HTTP connections. Set to ``*`` to listen on all interfaces,
      or to ``0.0.0.0`` to only listen over IPv4.

      Defaults to ``*``.

  ``NOHUB_METRICS_PORT``
      Metrics are served over HTTP. This setting controls which port to listen on
      for HTTP connections.

      Defaults to ``9981``.

Lobbies
-------

.. seealso::
   See :ref:`Concepts/Lobbies` to learn more.

.. glossary::

  ``NOHUB_LOBBIES_ID_LENGTH``
      Length of IDs generated for lobbies.

      Defaults to ``8``.

  ``NOHUB_LOBBIES_WITHOUT_GAME``
      Set to true to enable lobbies that don't belong to any game.

      Defaults to ``true``.

  ``NOHUB_LOBBIES_MAX_COUNT``
      Maximum number of active lobbies allowed on this instance. 

      Set to ``0`` to disable this limit.

      Defaults to ``32768``.

  ``NOHUB_LOBBIES_MAX_PER_SESSION``
      Maximum number of active lobbies allowed per session. 

      Set to ``0`` to disable this limit.

      Defaults to ``4``.

  ``NOHUB_LOBBIES_MAX_DATA_ENTRIES``
      Maximum number of custom data entries per lobby.

      Note that this does not limit the actual data size of those entries - that
      is practically limited by how much data fits into a single command, see
      :term:`NOHUB_TCP_COMMAND_BUFFER_SIZE`.

      Set to ``0`` to disable this limit.

      Defaults to ``128``.

Sessions
--------

.. seealso::
   See :ref:`Concepts/Sessions` to learn more.

.. glossary::

  ``NOHUB_SESSIONS_ID_LENGTH``
      Length of IDs generated for sessions.

      Defaults to ``12``.

  ``NOHUB_SESSIONS_ARBITRARY_GAME_ID``
      Set to ``true`` to enable sessions that reference unknown games. This will
      enable clients to use any game, not just the ones configured in
      :term:`NOHUB_GAMES`.

      Defaults to ``true``.

  ``NOHUB_SESSIONS_DEFAULT_GAME_ID``
      Assign a game to each new session - this effectively means that nohub will
      allow only a single game.

      Use an ID from the list specified in :term:`NOHUB_GAMES`.

      Defaults to an empty string.

  ``NOHUB_SESSIONS_MAX_COUNT``
      Maximum number of sessions managed by this instance.

      Set to ``0`` to disable this limit.

      Defaults to ``262144``.


  ``NOHUB_SESSIONS_MAX_PER_ADDRESS``
      Maximum number of sessions from the same IP address ( disregarding port ).

      Set to ``0`` to disable this limit.

      Defaults to ``64``.


Logging
-------

.. glossary::

   ``NOHUB_LOG_LEVEL``
    Logging level.

    Known values are ``silent``, ``trace``, ``debug``, ``info``, ``warn``, ``error``, ``fatal``.

    Defaults to ``info``.
