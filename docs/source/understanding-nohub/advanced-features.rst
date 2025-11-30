Approaching advanced features
=============================

At its core, *nohub* aims to be usable both in the simplest setup where it's
running on its own, and in more complex setups where it's part of a software
stack.

As a consequence, building advanced features can be approached in multiple
ways.

This page describes those approaches, and demonstrates them in a few examples.

Client-driven approaches
------------------------

In case the focus is building a game and not a backend, *client-driven
approaches* may be a great fit.

Client-driven means that the clients will control *nohub*, while *nohub* itself
acts as a simple data-store. Clients connect directly to *nohub*, and often
they don't connect to any other service.

This is rather easy to build, but is also inherently less secure, since it
hands over control to the game client. The game client is distributed to the
players, and thus can be tampered with.

Sever-driven approaches
-----------------------

In case where security is a strong focus, and / or more development manpower is
available, *server-driven* approaches work well.

Server-driven means that strong validations and custom operations are
implemented on the server-side, limiting or eliminating possible malicious
actions from players.

While this has the upside of being more secure, it also needs knowledge in
building webservices. It also requires a time investment into building a
dedicated backend solution around *nohub*.

Examples
--------

Note that these examples are theoretical. The actual implementation may differ
from game to game.

Password-locked lobbies
^^^^^^^^^^^^^^^^^^^^^^^

We want to allow players to specify a password for the lobby they create. When
other players join, they need to enter this password to actually join.

A *client-driven approach* may not need any additional actions from *nohub*.
When a client wants to join, they receive the host's address and connect to it.
Upon connection, the host requests the password from the client. The client
sends a response packed with the password entered by the user. If the password
doesn't match, the server disconnects the client.

An extra flag may be appended to the lobby's *custom data* to let players know
they're joining a password-locked lobby.

A *server-driven* approach may be implementing a validation layer between the
player and *nohub*. Players would connect to the validation layer, which would
in turn forward their requests to *nohub*. Upon joining, the validation layer
asks the player for a password if needed. If the player responds with the
correct password, the validation layer replies with the lobby's address,
allowing the player to connect.

.. note::
   This feature is considered in `#67`_

.. _#67: https://github.com/foxssake/nohub/issues/67

Matchmaking
^^^^^^^^^^^

We want to automatically connect players to the right lobbies, so players don't
have to manually browse. The system should find a good fit for the player.

A *client-driven approach* may track some kind of MMR value for the player
locally. When a lobby is created, its preferred MMR value is stored as *custom
data*. When another player starts looking for a lobby, the game lists all the
available lobbies, and finds the best match based on the locally tracked MMR,
and the MMR attached to the lobby.

Unfortunately this may be tampered with, e.g. by a malicious actor disregarding
the MMR preference, or misrepresenting their own MMR.

A *server-driven approach* could be to implement a companion service that
recommends lobbies. Each player would have their own online account, that keeps
track of their game history and MMR. When a player creates a lobby, they attach
their account ID to the lobby as custom data. When another player wants to join
a lobby, they ask the lobby recommending service. The service checks both the
player's account and the account attached to each lobby, and compares MMR
values. It then responds with the lobby best matching the player's MMR.
