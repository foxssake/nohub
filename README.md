# nohub

*nohub* is a lobby manager for online games that:

- 🚀 Is easy to host
- 🔮 Can be used with any engine or game
- 🪄 Doesn't require writing a backend
- ⚙️ Focused and lightweight - manages lobbies, no fluff

![Browser](docs/source/assets/forest-brawl.png)

It runs on [bun], using the human-readable [Trimsock] protocol.

## Features

- Manage a list of lobbies / game servers
- Hidden lobbies - players can only join with the lobby's ID
- Locked lobbies - still visible, but players can't join
- Custom lobby data - lobby name, player count, current map, anything your game
  might need!
- Manage one or multiple games in a single *nohub* instance
- Metrics via [Prometheus] - always be aware how your server is doing!
- WebSocket support for web-based games (Godot web exports, browser games)

## Usage

While this README provides instructions to get started, *nohub* has a dedicated
site for documentation:

[nohub guide](https://foxssake.github.io/nohub/index.html)

## Getting started

### Integrating nohub

For Godot, we provide the [nohub.gd] addon.

For other engines or languages, see the guide on [custom integrations].

### Running nohub

#### Using Docker

Docker images are regularly published from the `main` branch. See the [*nohub*
docker image].

To run the *nohub* docker image, make sure to expose the necessary ports:

```sh
docker run -p 9980:9980 -p 9981:9981 -p 9982:9982 ghcr.io/foxssake/nohub:main
```

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
git clone https://github.com/foxssake/nohub.git
cd nohub/nohub

# Install dependencies
bun install

# Start nohub
bun .
```

## Issues

If you encounter any problems, feel free to [submit an issue].

Alternatively, join our [Discord server].

## License

*nohub* is licensed under the [MIT License](LICENSE).


[Bun]: https://bun.sh/
[bun]: https://bun.sh/
[Trimsock]: https://github.com/foxssake/trimsock
[Prometheus]: https://prometheus.io/
[nohub.gd]: ./nohub.gd
[custom integrations]: https://foxssake.github.io/nohub/getting-started/using-nohub.html#custom-integrations
[*nohub* docker image]: https://github.com/foxssake/nohub/pkgs/container/nohub
[submit an issue]: https://github.com/foxssake/nohub/issues
[Discord server]: https://discord.gg/nKVFYdDg2y
