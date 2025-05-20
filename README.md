# mobhub

A lobby manager for multiplayer games.

## Proposals

This section contains proposals on what *mobhub* should be, and how to
implement it.

### Vision

*Mobhub* should be a simple to manage, self-hosted solution for managing player
lobbies and server lists for multiplayer games.

* Should be easy to integrate with Godot, but not exclusive to it
  * This includes other game engines, but also games built from scratch
* Should be easy to self-host
  * Easy to setup on a variety of setups, from a single VPS to large Kubernetes
    clusters
* Should be game-agnostic
  * Does not make assumptions about the game if not necessary
  * Does not prescribe what the user's game should be like
* Should be focused
  * Includes only the features needed to bring players together in lobbies

### Use cases

Some common usages for lobby services and how they relate to *mobhub*:

TODO

### Features

TODO: Features to implement based on use cases

### Authentication

TODO

### High level architecture

TODO: Some mermaid diagrams of the various components

### Data model

TODO: Some mermaid diagrams of what data is stored ( lobbies, participants, etc. )

### Tech stack

TODO: List of tech to use, probably Go-based
