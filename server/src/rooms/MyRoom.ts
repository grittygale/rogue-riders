import { Room, Client } from "@colyseus/core";
import { MyRoomState, PlayerState } from "./schema/MyRoomState";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface JoinOptions {
  // Add any specific join options here if needed
}

interface GameMessage {
  type: string;
  data?: unknown;
}

const PLAYER_COLORS = [
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
];

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();
  private clientIds = new Set<string>();
  private usedColors = new Set<string>();

  onCreate() {
    this.setState(new MyRoomState());

    // Disable the lint rule for unused parameters since this is a placeholder
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.onMessage("type", (client: Client, message: GameMessage) => {
      // handle "type" message when implemented
    });
  }

  private getAvailableColor(): string {
    const availableColors = PLAYER_COLORS.filter(color => !this.usedColors.has(color));
    if (availableColors.length === 0) {
      // If all colors are used, generate a random color
      return '#' + Math.floor(Math.random()*16777215).toString(16);
    }
    return availableColors[0];
  }

  // Disable the lint rule for unused parameters since this is required by the interface
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onAuth(client: Client, options: JoinOptions) {
    // Check if client is already in the room
    if (this.clientIds.has(client.sessionId)) {
      throw new Error("Client already connected");
    }
    return true;
  }

  onJoin(client: Client) {
    console.log(client.sessionId, "joined!");
    this.clientIds.add(client.sessionId);

    // Assign a color to the player
    const color = this.getAvailableColor();
    this.usedColors.add(color);

    // Create player state with assigned color
    const player = new PlayerState(color);
    this.state.players.set(client.sessionId, player);
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.clientIds.delete(client.sessionId);

    // Get the player's color before removing them
    const player = this.state.players.get(client.sessionId);
    if (player) {
      this.usedColors.delete(player.color);
    }

    try {
      if (consented) {
        // Remove player immediately if they left intentionally
        this.state.players.delete(client.sessionId);
        throw new Error("Consented leave");
      }

      // Allow reconnection if the client didn't leave intentionally
      await this.allowReconnection(client, 10);
      console.log(client.sessionId, "reconnected!");
      this.clientIds.add(client.sessionId);

    } catch {
      // If reconnection fails or wasn't attempted, remove the player
      this.state.players.delete(client.sessionId);
      this.clientIds.delete(client.sessionId);
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    this.clientIds.clear();
    this.usedColors.clear();
  }
}
