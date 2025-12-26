Using nohub
===========

To get started, connect to a *nohub* server and start creating lobbies.

.. tip::
  A public *nohub* server is available at ``foxssake.studio:12980`` for testing.

With Godot
----------

Installing the addon
^^^^^^^^^^^^^^^^^^^^

To use *nohub* with the Godot engine, download the `nohub.gd`_ addon, from one
of the following sources:

- `GitHub Releases`_
- Godot Asset Library (TODO)
- Download `source`_
    - Copy the :file:`nohub-main/nohub.gd/addons/` folder into your Godot project

After installing the addon, make sure to enable both the `nohub.gd` and
`trimsock.gd` plugins in :menuselection:`Project --> Project Settings -->
Plugins`.


.. _`nohub.gd`: https://github.com/foxssake/nohub/tree/main/nohub.gd
.. _`GitHub Releases`: https://github.com/foxssake/nohub/releases
.. _`source`: https://github.com/foxssake/nohub/archive/refs/heads/main.zip

Establishing a connection
^^^^^^^^^^^^^^^^^^^^^^^^^

Connect to the desired *nohub* server over TCP using `StreamPeerTCP`_. Once the
connection has finished, create a ``NohubTCPClient`` instance with the connection:

.. highlight:: gdscript
.. code::

  var connection: StreamPeerTCP
  var client: NohubTCPClient

  func _ready():
    # Use public instance
    var host := "foxssake.studio"
    var port := 12980

    # Create connection
    connection = StreamPeerTCP.new()
    var err := connection.connect_to_host(host, port)
    if err != OK:
      push_error("Couldn't connect to nohub at %s:%d - %s" % [host, port, error_string(err)])
      return

    # Wait for connection to succeed
    while connection.get_status() == StreamPeerTCP.STATUS_CONNECTING:
      connection.poll()
      await get_tree().process_frame

    if connection.get_status() != StreamPeerTCP.STATUS_CONNECTED:
      push_error("Failed to establish connection to nohub at %s:%d - status: %d" % [host, port, connection.get_status()])
      return

    client = NohubTCPClient.new(connection)
    print("Successfully connected to nohub at %s:%d!" % [host, port])


.. _`StreamPeerTCP`: https://docs.godotengine.org/en/stable/classes/class_streampeertcp.html

Creating a lobby
^^^^^^^^^^^^^^^^

With the client instantiated, all of the supported commands are accessible.
Let's see how to create a lobby using the ``NohubTCPClient.create_lobby()``
method:

.. highlight:: gdscript
.. code::

    var result := await client.create_lobby("enet://localhost", { "cool": "true" })
    if not result.is_success():
      push_error("Failed creating lobby: %s" % result.error())
      return
    var lobby := result.value()

    print("Created lobby #%s!" % lobby)

Most calls to *nohub* return a ``Result`` object. It can either store the
result of the operation, accessed with ``Result.value()``, or an error,
accessed with ``Result.error()``.

.. tip::
   The full example is available in the `nohub.gd`_ source, in
   ``getting_started.tscn``. A more full-fledged lobby browser is also provided
   in ``browser.tscn``.

Custom integrations
-------------------

In case a *nohub* integration is not available for your specific use case, it's
also possible to implement your own integration. If so, please consider
`submitting a pull request`_!


.. _`submitting a pull request`: https://github.com/foxssake/nohub/pulls

Trimsock
^^^^^^^^

To exchange commands, *nohub* uses the `trimsock`_ protocol. It is designed to
be light-weight, human-readable, and relatively easy to implement.

For some languages, a reference implementation is already available. If your
language is not on the list, the two options are either implementing
`trimsock`_ for your language, or using a simplified approach, e.g. parsing the
specific *nohub* commands using regular expressions.

nohub
^^^^^

With `trimsock`_ available, the only remaining part is implementing the
commands for *nohub*. Refer to the :doc:`/server-guide/commands`.


.. _`trimsock`: https://github.com/foxssake/trimsock
