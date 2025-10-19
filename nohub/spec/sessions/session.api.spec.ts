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

let _session: SessionData;

describe("SessionApi", () => {
  beforeEach(() => {
    sessionRepository = new SessionRepository();
    const gameLookup = new GameRepository();
    Games.insert(gameLookup);
    Sessions.insert(sessionRepository);

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
      expect(() =>
        sessionApi.openSession(mockSocket(Sessions.dave.address)),
      ).not.toThrow();
      expect(() =>
        sessionApi.openSession(mockSocket(Sessions.dave.address)),
      ).not.toThrow();

      // Third should fail
      expect(() =>
        sessionApi.openSession(mockSocket(Sessions.dave.address)),
      ).toThrow(LimitError);
    });

    test("should ignore per address limit", () => {
      // Don't need fixtures
      sessionRepository.clear();

      // Remove limit
      config.maxPerAddress = 0;

      // Open lots of sessions
      for (let i = 0; i < 128; ++i)
        expect(() =>
          sessionApi.openSession(mockSocket(Sessions.dave.address)),
        ).not.toThrow();
    });

    test("should not exceed global limit", () => {
      // Don't need fixtures
      sessionRepository.clear();

      // Set limit
      config.maxCount = 2;

      // First two sessions should pass
      expect(() =>
        sessionApi.openSession(mockSocket(Sessions.dave.address)),
      ).not.toThrow();
      expect(() =>
        sessionApi.openSession(mockSocket(Sessions.eric.address)),
      ).not.toThrow();

      // Third should fail
      expect(() =>
        sessionApi.openSession(mockSocket(Sessions.ingrid.address)),
      ).toThrow(LimitError);
    });

    test("should ignore global limit", () => {
      // Don't need fixtures
      sessionRepository.clear();

      // Remove limits
      config.maxPerAddress = 0;
      config.maxCount = 0;

      // Open lots of sessions
      for (let i = 0; i < 128; ++i)
        expect(() =>
          sessionApi.openSession(mockSocket(Sessions.dave.address)),
        ).not.toThrow();
    });
  });

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
    write: (
      _data: string | Bun.BufferSource,
      _byteOffset?: number,
      _byteLength?: number,
    ): number => {
      throw new Error("Function not implemented.");
    },
    data: { id: "", address: "" },
    end: (
      _data?: string | Bun.BufferSource,
      _byteOffset?: number,
      _byteLength?: number,
    ): number => {
      throw new Error("Function not implemented.");
    },
    ref: (): void => {
      throw new Error("Function not implemented.");
    },
    timeout: (_seconds: number): void => {
      throw new Error("Function not implemented.");
    },
    terminate: (): void => {
      throw new Error("Function not implemented.");
    },
    shutdown: (_halfClose?: boolean): void => {
      throw new Error("Function not implemented.");
    },
    readyState: 0,
    unref: (): void => {
      throw new Error("Function not implemented.");
    },
    flush: (): void => {
      throw new Error("Function not implemented.");
    },
    reload: (_handler: Bun.SocketHandler): void => {
      throw new Error("Function not implemented.");
    },
    remoteFamily: "IPv4",
    remotePort: 0,
    localFamily: "IPv4",
    localAddress: "",
    localPort: 0,
    authorized: false,
    alpnProtocol: null,
    disableRenegotiation: (): void => {
      throw new Error("Function not implemented.");
    },
    exportKeyingMaterial: (
      _length: number,
      _label: string,
      _context: Buffer,
    ): Buffer => {
      throw new Error("Function not implemented.");
    },
    getAuthorizationError: (): Error | null => {
      throw new Error("Function not implemented.");
    },
    getCertificate: (): import("tls").PeerCertificate | object | null => {
      throw new Error("Function not implemented.");
    },
    getX509Certificate: (): import("crypto").X509Certificate | undefined => {
      throw new Error("Function not implemented.");
    },
    getCipher: (): import("tls").CipherNameAndProtocol => {
      throw new Error("Function not implemented.");
    },
    getEphemeralKeyInfo: (): import("tls").EphemeralKeyInfo | object | null => {
      throw new Error("Function not implemented.");
    },
    getPeerCertificate: (): import("tls").PeerCertificate => {
      throw new Error("Function not implemented.");
    },
    getPeerX509Certificate: (): import("crypto").X509Certificate => {
      throw new Error("Function not implemented.");
    },
    getSharedSigalgs: (): string[] => {
      throw new Error("Function not implemented.");
    },
    getTLSFinishedMessage: (): Buffer | undefined => {
      throw new Error("Function not implemented.");
    },
    getTLSPeerFinishedMessage: (): Buffer | undefined => {
      throw new Error("Function not implemented.");
    },
    getTLSTicket: (): Buffer | undefined => {
      throw new Error("Function not implemented.");
    },
    getTLSVersion: (): string => {
      throw new Error("Function not implemented.");
    },
    isSessionReused: (): boolean => {
      throw new Error("Function not implemented.");
    },
    setMaxSendFragment: (_size: number): boolean => {
      throw new Error("Function not implemented.");
    },
    setNoDelay: (_noDelay?: boolean): boolean => {
      throw new Error("Function not implemented.");
    },
    setKeepAlive: (_enable?: boolean, _initialDelay?: number): boolean => {
      throw new Error("Function not implemented.");
    },
    bytesWritten: 0,
    resume: (): void => {
      throw new Error("Function not implemented.");
    },
    pause: (): void => {
      throw new Error("Function not implemented.");
    },
    renegotiate: (): void => {
      throw new Error("Function not implemented.");
    },
    setVerifyMode: (
      _requestCert: boolean,
      _rejectUnauthorized: boolean,
    ): void => {
      throw new Error("Function not implemented.");
    },
    getSession: (): void => {
      throw new Error("Function not implemented.");
    },
    setSession: (_session: string | Buffer | Bun.BufferSource): void => {
      throw new Error("Function not implemented.");
    },
    upgradeTLS: <Data>(
      _options: Bun.TLSUpgradeOptions<Data>,
    ): [raw: Socket<Data>, tls: Socket<Data>] => {
      throw new Error("Function not implemented.");
    },
    close: (): void => {
      throw new Error("Function not implemented.");
    },
    getServername: (): string => {
      throw new Error("Function not implemented.");
    },
    setServername: (_name: string): void => {
      throw new Error("Function not implemented.");
    },
    [Symbol.dispose]: (): void => {
      throw new Error("Function not implemented.");
    },
  };
}
