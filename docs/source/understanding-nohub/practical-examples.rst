Practical examples
==================

To gain a better understanding of *nohub*, let's see a few common features and
how they can happen with *nohub*.

Pre-game lobbies
----------------

Once the player joins a lobby, they are not dropped into an active game, but
onto a screen where they can setup their character, pick teams, vote on maps,
etc.

With *nohub*, when a player joins a lobby, they directly connect to the host.
Thus, implementing the pre-game lobby falls on the game itself, rather than
*nohub*. In your game, implement your pre-game screen, and then track whether
the game has already started or not.

This way, the game server itself controls the transition from pre-game lobby to
the actual game. Once the game starts, delete the lobby, so more players won't
try to join.

Player count limit
------------------

A game host may want to limit the number of players that can connect. This can
be due to the host not being able to handle more with the expected performance,
the game map not fitting more people, or any other reason.

With *nohub*, set a player count and player limit property on the lobby's
custom data. This is updated by the server, whenever a player joins or leaves.
This allows other players to see how many people are playing in a given lobby.

Once all player slots are filled, lock the lobby. Other players will be able to
see that the lobby is locked, and *nohub* will respond with an error to anyone
trying to join.

Make sure to limit number of connections in your game as well. This avoids edge
cases where someone joins after all the slots are filled, but before the lobby
is locked, or some malicious client uses the address string to connect using
multiple connections.

With Godot, this can be done by setting
`SceneMultiplayer.refuse_new_connections`_ to true when there are no more slots
available. Alternatively, specify the limit when starting the host, e.g. in
`ENetMultiplayerPeer.create_server()`_ using the ``max_clients`` parameter.


.. _SceneMultiplayer.refuse_new_connections: https://docs.godotengine.org/en/stable/classes/class_scenemultiplayer.html#class-scenemultiplayer-property-refuse-new-connections
.. _ENetMultiplayerPeer.create_server(): https://docs.godotengine.org/en/stable/classes/class_enetmultiplayerpeer.html#class-enetmultiplayerpeer-method-create-server

Password-locked lobbies
-----------------------

When joining a lobby, the player needs to provide a password. If the password
doesn't match, they can't join.

With *nohub*, attach a flag to the lobby's custom data, letting other players
know that they need to provide a password.

When joining, the game server prompts the client for the password. If the
password matches, the connection is accepted. Otherwise, the game server
rejects the connection.

Since password validation happens on the game server itself, it can't be
circumvented easily.

Specifically with Godot, this can be done with
`SceneMultiplayer.auth_callback`_ and `SceneMultiplayer.send_auth()`_.


.. _SceneMultiplayer.auth_callback: https://docs.godotengine.org/en/stable/classes/class_scenemultiplayer.html#class-scenemultiplayer-property-auth-callback
.. _SceneMultiplayer.send_auth(): https://docs.godotengine.org/en/stable/classes/class_scenemultiplayer.html#class-scenemultiplayer-method-send-auth
