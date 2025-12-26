import type { ServerWebSocket } from "bun";
import type { WebSocketConfig } from "@src/config";
import { rootLogger } from "@src/logger";
import type { Module } from "@src/module";
import type { Nohub } from "@src/nohub";

interface WebSocketData {
  tcpSocket: TCPSocket;
  buffer: Buffer[];
}

export class WebSocketModule implements Module {
  private server?: Bun.Server;
  private nohub?: Nohub;
  private readonly logger = rootLogger.child({ module: "websocket" });

  constructor(private readonly config: WebSocketConfig) {}

  attachTo(app: Nohub): void {
    this.nohub = app;
    
    if (!this.config.enabled) {
      this.logger.info("WebSocket proxy disabled");
      return;
    }

    this.startWebSocketServer();
  }

  private async startWebSocketServer() {
    if (!this.nohub) {
      throw new Error("WebSocket module not attached to nohub instance");
    }

    const tcpHost = this.nohub.config.tcp.host === "*" ? "localhost" : this.nohub.config.tcp.host;
    const tcpPort = this.nohub.config.tcp.port;

    this.server = Bun.serve({
      hostname: this.config.host === "*" ? undefined : this.config.host,
      port: this.config.port,
      
      fetch: async (req, server) => {
        const url = new URL(req.url);
        
        if (url.pathname !== this.config.path) {
          return new Response("Not Found", { status: 404 });
        }

        if (server.upgrade(req)) {
          return;
        }

        return new Response("Upgrade failed", { status: 400 });
      },

      websocket: {
        async open(ws: ServerWebSocket<WebSocketData>) {
          try {
            // Create TCP connection to the nohub server
            const tcpSocket = await Bun.connect({
              hostname: tcpHost,
              port: tcpPort,
              socket: {
                data(socket, data) {
                  // Forward TCP data to WebSocket
                  if (ws.readyState === 1) { // WebSocket.OPEN
                    ws.send(data);
                  }
                },
                error(socket, error) {
                  rootLogger.error({ error }, "TCP socket error in WebSocket proxy");
                  ws.close();
                },
                close(socket) {
                  if (ws.readyState === 1) { // WebSocket.OPEN
                    ws.close();
                  }
                }
              }
            });

            ws.data = {
              tcpSocket,
              buffer: []
            };

            rootLogger.debug("WebSocket client connected, TCP bridge established");
          } catch (error) {
            rootLogger.error({ error }, "Failed to establish TCP connection for WebSocket client");
            ws.close();
          }
        },

        message(ws: ServerWebSocket<WebSocketData>, message) {
          // Forward WebSocket message to TCP socket
          if (ws.data?.tcpSocket) {
            try {
              let data: Buffer;
              if (message instanceof Buffer) {
                data = message;
              } else if (typeof message === "string") {
                data = Buffer.from(message, "utf8");
              } else {
                data = Buffer.from(message);
              }
              
              ws.data.tcpSocket.write(data);
            } catch (error) {
              rootLogger.error({ error }, "Failed to forward WebSocket message to TCP");
              ws.close();
            }
          }
        },

        close(ws: ServerWebSocket<WebSocketData>) {
          // Close TCP connection when WebSocket closes
          if (ws.data?.tcpSocket) {
            try {
              ws.data.tcpSocket.end();
            } catch (error) {
              rootLogger.error({ error }, "Error closing TCP socket");
            }
          }
          rootLogger.debug("WebSocket client disconnected");
        },

        error(ws: ServerWebSocket<WebSocketData>, error) {
          rootLogger.error({ error }, "WebSocket error");
          if (ws.data?.tcpSocket) {
            try {
              ws.data.tcpSocket.end();
            } catch (e) {
              // Were tearing down the socket, ignore errors
            }
          }
        }
      }
    });

    this.logger.info("WebSocket proxy listening on %s:%d%s", 
      this.config.host, this.config.port, this.config.path);
  }

  shutdown(): void {
    if (this.server) {
      this.server.stop(true);
      this.logger.info("WebSocket proxy stopped");
    }
  }
}