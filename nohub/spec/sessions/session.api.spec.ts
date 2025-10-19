import { beforeEach, describe, expect, test } from "bun:test";
import { Games, Sessions } from "@spec/fixtures";
import { readDefaultConfig, type SessionsConfig } from "@src/config";
import { DataNotFoundError, LimitError } from "@src/errors";
import { NohubEventBus } from "@src/events";
import { GameRepository } from "@src/games/game.repository";
import { LobbyRepository } from "@src/lobbies/lobby.repository";
import type { SessionData } from "@src/sessions/session";
import { SessionApi } from "@src/sessions/session.api";
import { SessionRepository } from "@src/sessions/session.repository";
import type { Socket } from "bun";

let config: SessionsConfig;
let sessionRepository: SessionRepository;
let sessionApi: SessionApi;

let session: SessionData;

describe("SessionApi", () => {
  beforeEach(() => {
    sessionRepository = new SessionRepository();
    const gameLookup = new GameRepository();
    Games.insert(gameLookup);
    Sessions.insert(sessionRepository)

    config = readDefaultConfig().sessions;

    sessionApi = new SessionApi(
      sessionRepository,
      new LobbyRepository(),
      gameLookup,
      new NohubEventBus(),
      config,
    );
  });

  describe("openSession", () => {
    test("should not exceed per address limit", () => {
      // Don't need fixtures
      sessionRepository.clear();

      // Set limit
      config.maxPerAddress = 2;

      // First two sessions should pass
      expect(() => sessionApi.openSession(mockSocket(Sessions.dave.address))).not.toThrow();
      expect(() => sessionApi.openSession(mockSocket(Sessions.dave.address))).not.toThrow();

      // Third should fail
      expect(() => sessionApi.openSession(mockSocket(Sessions.dave.address))).toThrow(LimitError);
    })

    test("should ignore per address limit", () => {
      // Don't need fixtures
      sessionRepository.clear();

      // Remove limit
      config.maxPerAddress = 0;

      // Open lots of sessions
      for (let i = 0; i < 128; ++i)
        expect(() => sessionApi.openSession(mockSocket(Sessions.dave.address))).not.toThrow();
    })

    test("should not exceed global limit", () => {
      // Don't need fixtures
      sessionRepository.clear();

      // Set limit
      config.maxCount = 2

      // First two sessions should pass
      expect(() => sessionApi.openSession(mockSocket(Sessions.dave.address))).not.toThrow();
      expect(() => sessionApi.openSession(mockSocket(Sessions.eric.address))).not.toThrow();

      // Third should fail
      expect(() => sessionApi.openSession(mockSocket(Sessions.ingrid.address))).toThrow(LimitError);
    })

    test("should ignore global limit", () => {
      // Don't need fixtures
      sessionRepository.clear();

      // Remove limits
      config.maxPerAddress = 0;
      config.maxCount = 0;

      // Open lots of sessions
      for (let i = 0; i < 128; ++i)
        expect(() => sessionApi.openSession(mockSocket(Sessions.dave.address))).not.toThrow();
    })
  })

  describe("setGame", () => {
    test("should throw on unknown game", () => {
      expect(() => sessionApi.setGame(Sessions.pam, "foo")).toThrow(
        DataNotFoundError,
      );
    });

    test("should succeed on unknown game", () => {
      config.arbitraryGameId = true;
      expect(() => sessionApi.setGame(Sessions.pam, "foo")).not.toThrow();
    });
  });
});

function mockSocket(address: string): Socket<SessionData> {
  return {
    remoteAddress: address,
    write: function(data: string | Bun.BufferSource, byteOffset?: number, byteLength?: number): number {
        throw new Error("Function not implemented.");
    },
    data: { id: "", address: "" },
    end: function(data?: string | Bun.BufferSource, byteOffset?: number, byteLength?: number): number {
        throw new Error("Function not implemented.");
    },
    ref: function(): void {
        throw new Error("Function not implemented.");
    },
    timeout: function(seconds: number): void {
        throw new Error("Function not implemented.");
    },
    terminate: function(): void {
        throw new Error("Function not implemented.");
    },
    shutdown: function(halfClose?: boolean): void {
        throw new Error("Function not implemented.");
    },
    readyState: 0,
    unref: function(): void {
        throw new Error("Function not implemented.");
    },
    flush: function(): void {
        throw new Error("Function not implemented.");
    },
    reload: function(handler: Bun.SocketHandler): void {
        throw new Error("Function not implemented.");
    },
    remoteFamily: "IPv4",
    remotePort: 0,
    localFamily: "IPv4",
    localAddress: "",
    localPort: 0,
    authorized: false,
    alpnProtocol: null,
    disableRenegotiation: function(): void {
        throw new Error("Function not implemented.");
    },
    exportKeyingMaterial: function(length: number, label: string, context: Buffer): Buffer {
        throw new Error("Function not implemented.");
    },
    getAuthorizationError: function(): Error | null {
        throw new Error("Function not implemented.");
    },
    getCertificate: function(): import("tls").PeerCertificate | object | null {
        throw new Error("Function not implemented.");
    },
    getX509Certificate: function(): import("crypto").X509Certificate | undefined {
        throw new Error("Function not implemented.");
    },
    getCipher: function(): import("tls").CipherNameAndProtocol {
        throw new Error("Function not implemented.");
    },
    getEphemeralKeyInfo: function(): import("tls").EphemeralKeyInfo | object | null {
        throw new Error("Function not implemented.");
    },
    getPeerCertificate: function(): import("tls").PeerCertificate {
        throw new Error("Function not implemented.");
    },
    getPeerX509Certificate: function(): import("crypto").X509Certificate {
        throw new Error("Function not implemented.");
    },
    getSharedSigalgs: function(): string[] {
        throw new Error("Function not implemented.");
    },
    getTLSFinishedMessage: function(): Buffer | undefined {
        throw new Error("Function not implemented.");
    },
    getTLSPeerFinishedMessage: function(): Buffer | undefined {
        throw new Error("Function not implemented.");
    },
    getTLSTicket: function(): Buffer | undefined {
        throw new Error("Function not implemented.");
    },
    getTLSVersion: function(): string {
        throw new Error("Function not implemented.");
    },
    isSessionReused: function(): boolean {
        throw new Error("Function not implemented.");
    },
    setMaxSendFragment: function(size: number): boolean {
        throw new Error("Function not implemented.");
    },
    setNoDelay: function(noDelay?: boolean): boolean {
        throw new Error("Function not implemented.");
    },
    setKeepAlive: function(enable?: boolean, initialDelay?: number): boolean {
        throw new Error("Function not implemented.");
    },
    bytesWritten: 0,
    resume: function(): void {
        throw new Error("Function not implemented.");
    },
    pause: function(): void {
        throw new Error("Function not implemented.");
    },
    renegotiate: function(): void {
        throw new Error("Function not implemented.");
    },
    setVerifyMode: function(requestCert: boolean, rejectUnauthorized: boolean): void {
        throw new Error("Function not implemented.");
    },
    getSession: function(): void {
        throw new Error("Function not implemented.");
    },
    setSession: function(session: string | Buffer | Bun.BufferSource): void {
        throw new Error("Function not implemented.");
    },
    upgradeTLS: function <Data>(options: Bun.TLSUpgradeOptions<Data>): [raw: Socket<Data>, tls: Socket<Data>] {
        throw new Error("Function not implemented.");
    },
    close: function(): void {
        throw new Error("Function not implemented.");
    },
    getServername: function(): string {
        throw new Error("Function not implemented.");
    },
    setServername: function(name: string): void {
        throw new Error("Function not implemented.");
    },
    [Symbol.dispose]: function(): void {
        throw new Error("Function not implemented.");
    }
}
}
