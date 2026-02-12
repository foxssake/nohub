Running nohub
=============

.. tip::
  This page describes how to run a *nohub* instance. If you just want to
  experiment, you can use the public instance at ``foxssake.studio:12980``.

Using Docker
------------

A docker image is regularly published from the `main` branch.

To run the *nohub* docker image, make sure to expose the necessary ports:

.. highlight:: sh
.. code::

  docker run -p 9980:9980 -p 9981:9981 ghcr.io/foxssake/nohub:main

This exposes port ``9980`` for clients to connect on, and port ``9981`` to
serve metrics.

Docker Compose
^^^^^^^^^^^^^^

It is possible to run *nohub* in conjunction with other services using Docker
Compose:

Using bun
---------

Alternatively, *nohub* can be run from source, using the following steps:

1. Make sure `bun`_ is installed on your system
2. Acquire the *nohub* source, e.g. by cloning it
3. Install dependencies
4. Start *nohub*

Example commands for Linux:

.. highlight:: sh
.. code::

  # Install bun
  curl -fsSL https://bun.sh/install | bash

  # Clone nohub and enter server directory
  git clone https://github.com/foxssake/nohub.git
  cd nohub/nohub

  # Install dependencies
  bun install

  # Start nohub
  bun .


.. _`bun`: https://bun.sh/
