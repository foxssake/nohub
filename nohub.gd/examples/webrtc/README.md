# nohub WebRTC Example

This example provides a way to use nohub to form WebRTC lobbies and connections.

### nohub

- Install bun
- Run nohub
- like these commands for Linux:

```
# Install bun
curl -fsSL https://bun.sh/install | bash

# Clone nohub and enter server directory
git clone https://github.com/foxssake/nohub.git
cd nohub/nohub

# Install dependencies
bun install

# Start nohub
bun run dev
```

Set up your .env for Nohub to use session id length 9 and set session ids to use numbers. (Ensures that a Godot peer can be created from each session)

```
# Shorten ids to be the correct size for Godot
NOHUB_SESSIONS_ID_LENGTH=9

# Set to true to create session ids as number
NOHUB_SESSIONS_ID_USE_NUMBER=true
```

### Godot Client (/nohub.gd)

- Download the latest binary from the releases in the official webrtc-native repo: https://github.com/godotengine/webrtc-native
- Unzip into the root of a Godot project (in this case, the `/nohub.gd`, where the .godot folder is located)
- Use the example node provided in `browser_webrtc.tscn`
- Listen to the signals `peer_connected` and `peer_disconnected` to add and remove players
- See docs for [WebRTCMultiplayerPeer](https://docs.godotengine.org/en/4.4/classes/class_webrtcmultiplayerpeer.html#class-webrtcmultiplayerpeer)

```
func start_web_rtc(id: String):
	web_rtc_peer = WebRTCMultiplayerPeer.new()
	web_rtc_peer.create_mesh(int(id))
	multiplayer.multiplayer_peer = web_rtc_peer

	multiplayer.peer_connected.connect(func(id): print(\"Add player: \", id))
	multiplayer.peer_disconnected.connect(func(id): print(\"Remove player: \", id))
```

Replace the `print` statements with game logic
