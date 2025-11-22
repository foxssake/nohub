Supporting multiple games
=========================

It is possible to host lobbies for not just one, but multiple games using *nohub*.

.. seealso::
  See :ref:`Concepts/Games` to learn more.

Running with a single game
--------------------------

To track only a single game, enable :term:`NOHUB_LOBBIES_WITHOUT_GAME`, and set
:term:`NOHUB_GAMES` to an empty list.

This way, sessions won't belong to any game by default, and won't be able to do
so either. Thus, lobbies won't belong to any games either.

Running with multiple games
---------------------------

Make sure to configure :term:`NOHUB_GAMES` to the list of games hosted on your
*nohub* instance. To support any game, not just the ones configured, enable
:term:`NOHUB_SESSIONS_ARBITRARY_GAME_ID`. This will allow clients to submit any
game ID they want.

To require each session to belong to a game, disable
:term:`NOHUB_LOBBIES_WITHOUT_GAME`. This will reject lobby creations unless
they belong to a game.

With multiple games, each session is restricted to the game they belong to.
They won't be able to list, query, or join lobbies that belong to other games.
