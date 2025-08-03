export interface Lobby {
  id: string;
  owner: string;
  isVisible: boolean;
  isLocked: boolean;
  data: Map<string, string>;
}
