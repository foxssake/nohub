# nohub

*nohub* is a lobby manager for online games that is:

- Built to be self-hostable
- Engine- and game-agnostic
- Doesn't need a custom backend
- Focused - it manages lobbies, nothing more, nothing less

It runs on [bun], using the human-readable [Trimsock] protocol.

## Features

- Manage a list of lobbies / game servers
- Hidden lobbies - players can only join with the lobby's ID
- Locked lobbies - still visible, but players can't join
- Custom lobby data - lobby name, player count, current map, anything your game
  might need!
- Manage one or multiple games in a single *nohub* instance
- Metrics via [Prometheus] - always be aware how your server is doing!

## Getting started

### Integrating nohub

For Godot, we provide the [nohub.gd] addon.

For other engines or languages, see the guide on custom integrations ( TODO ).

### Running nohub

#### Using Docker

Docker images are regularly published from the `main` branch. See the [*nohub*
docker image].

To run using Docker, expose the necessary ports, and make sure *nohub* listens
for outside connections:

```sh
docker run -p 9980:9980 -p 9981:9981 \
           -e NOHUB_TCP_HOST=* NOHUB_METRICS_HOST=* \
           ghcr.io/foxssake/nohub:main
```

The above will:

- publish port `9980` for the clients
- publish port `9981` for metrics
- configure *nohub* to listen on all available interfaces for clients
- configure *nohub* to listen on all available interfaces for scraping metrics

#### Using bun

Alternatively, *nohub* can be run from source, using the following steps:

1. Make sure [bun] is installed on your system
1. Acquire the *nohub* source, e.g. by cloning it
1. Install dependencies
1. Start *nohub*

Example commands for Linux:

```sh
# Install bun
curl -fsSL https://bun.sh/install | bash

# Clone nohub and enter server directory
https://github.com/foxssake/nohub.git
cd nohub/nohub

# Install dependencies
bun install

# Start nohub
NOHUB_TCP_HOST=* NOHUB_METRICS_HOST=* bun .
```

## Issues

If you encounter any problems, feel free to [submit an issue].

Alternatively, join our [Discord server].

## License

TODO


[Bun]: https://bun.dev/
[bun]: https://bun.dev/
[Trimsock]: https://github.com/foxssake/trimsock
[Prometheus]: https://prometheus.io/
[nohub.gd]: ./nohub.gd
[*nohub* docker image]: https://github.com/foxssake/nohub/pkgs/container/nohub
[submit an issue]: https://github.com/foxssake/nohub/issues
[Discord server]: https://discord.gg/nKVFYdDg2y
