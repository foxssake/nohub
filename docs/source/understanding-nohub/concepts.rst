Concepts
========

This page explains the core building blocks that *nohub* uses to manage
lobbies. This knowledge is useful when designing and implementing features
around *nohub*.

Games
-----

A `Game` is an application or software release that uses *nohub* to manage
Lobbies.

By default, *nohub* does not track multiple games, and assumes each lobby
belongs to the same game.

However, *nohub* can be configured to manage lobbies for multiple games. In
this case, nohub will also keep a list of games that it manages.

ID
    Each game has an ID. It is an arbitrary string, unique to it.

Name
    Games may also have a name. This is data is kept to make it easier to
    understand what's going on in *nohub*.

Sessions
--------

Whenever a client connects to *nohub*, a session is created for them. This
session is active as long as the connection is live, and is destroyed once the
connection is terminated.

Sessions may be associated to *Games*.

Lobbies
-------

A lobby is a hosted game that the player can join. In other software, they are
also called rooms.

A lobby belongs to the session that created it. The lobby can only be managed
by its owner session. Once the session ends, the lobby is automatically
destroyed.

ID
    Each lobby has an ID. This is an arbitrary string, unique to the lobby.

Address
    This is the address where players need to connect when they want to join the
    lobby. This can be anything, as long the game itself can parse and use it. It
    is good practice to make it a URI.

    For example:

    ``enet://221.230.23.3:32735``

    ``noray://foxssake.studio/sC2pnRfnBUhP``

Custom data
^^^^^^^^^^^

Since *nohub* is game-agnostic, it does not know the specifics about the game
it's supporting. Still, games often want to display data for each lobby, like
the name of the lobby, number of current players in the game, maximum number of
players, etc.

To achieve this, you can attach *custom data* to your lobbies. Custom data is a
key-value dictionary, that can store arbitrary data.

For example:

.. highlight:: json
.. code::

  {
    "name": "Dave's Lobby",
    "player-count": "6",
    "player-capacity": "8"
  }

Note that both keys and values are stored as strings.

Hidden lobbies
^^^^^^^^^^^^^^

Lobbies may be *hidden*. The lobby will not appear when listing lobbies.
Players can still join the lobby, if they have the lobby's ID.

Locked lobbies
^^^^^^^^^^^^^^

Lobbies may be *locked*. Locked lobbies are still visible, but player's can't
join them.
