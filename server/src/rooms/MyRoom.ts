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

interface UpdatePositionMessage {
  x: number;
  z: number;
  velocityX: number;
  velocityZ: number;
}

const PLAYER_COLORS = [
  "#FF0000", // Red
  "#00FF00", // Green
  "#0000FF", // Blue
  "#FFFF00", // Yellow
];

const LOBBY_SIZE = 100; // Size of the lobby area
const POSITION_QUANTUM = 0.25; // Quarter-unit precision for position quantization
const BALL_RADIUS = 5; // Radius of each ball
const COLLISION_COOLDOWN = 200; // Minimum time (ms) between collisions for the same ball
const RESTITUTION = 0.8; // Bounciness factor (1 = perfect elastic collision)
const FRICTION = 0.98; // Friction factor (applied to velocity each update)

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();
  private clientIds = new Set<string>();
  private usedColors = new Set<string>();
  private lastUpdateTime = Date.now();

  private quantizePosition(value: number): number {
    return Math.round(value / POSITION_QUANTUM) * POSITION_QUANTUM;
  }

  onCreate() {
    this.setState(new MyRoomState());

    // Handle position updates from clients
    this.onMessage("updatePosition", (client, message: UpdatePositionMessage) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        // Quantize positions before updating state
        player.x = this.quantizePosition(message.x);
        player.z = this.quantizePosition(message.z);
        player.velocityX = message.velocityX;
        player.velocityZ = message.velocityZ;

        // Check for collisions with other players
        this.checkCollisions(player, client.sessionId);
      }
    });

    // Set up physics update interval
    this.setSimulationInterval(() => this.updatePhysics());
  }

  private checkCollisions(player: PlayerState, playerId: string) {
    const now = Date.now();
    if (now - player.lastCollisionTime < COLLISION_COOLDOWN) return;

    this.state.players.forEach((otherPlayer, otherId) => {
      if (otherId === playerId) return;

      const dx = player.x - otherPlayer.x;
      const dz = player.z - otherPlayer.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      // Check if balls are colliding
      if (distance < BALL_RADIUS * 2) {
        // Only process if other ball hasn't recently collided
        if (now - otherPlayer.lastCollisionTime >= COLLISION_COOLDOWN) {
          this.resolveCollision(player, otherPlayer);
          player.lastCollisionTime = now;
          otherPlayer.lastCollisionTime = now;
        }
      }
    });
  }

  private resolveCollision(ball1: PlayerState, ball2: PlayerState) {
    // Calculate collision normal
    const dx = ball2.x - ball1.x;
    const dz = ball2.z - ball1.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Normalize the collision vector
    const nx = dx / distance;
    const nz = dz / distance;

    // Relative velocity
    const rvx = ball2.velocityX - ball1.velocityX;
    const rvz = ball2.velocityZ - ball1.velocityZ;

    // Relative velocity along normal
    const velAlongNormal = rvx * nx + rvz * nz;

    // Don't resolve if objects are moving apart
    if (velAlongNormal > 0) return;

    // Calculate impulse scalar
    const j = -(1 + RESTITUTION) * velAlongNormal;
    const impulseX = j * nx;
    const impulseZ = j * nz;

    // Apply impulse
    ball1.velocityX -= impulseX;
    ball1.velocityZ -= impulseZ;
    ball2.velocityX += impulseX;
    ball2.velocityZ += impulseZ;

    // Separate the balls to prevent sticking
    const overlap = (BALL_RADIUS * 2) - distance;
    const separationX = (overlap * nx) / 2;
    const separationZ = (overlap * nz) / 2;

    ball1.x = this.quantizePosition(ball1.x - separationX);
    ball1.z = this.quantizePosition(ball1.z - separationZ);
    ball2.x = this.quantizePosition(ball2.x + separationX);
    ball2.z = this.quantizePosition(ball2.z + separationZ);
  }

  private updatePhysics() {
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = now;

    // Update positions based on velocities
    this.state.players.forEach(player => {
      // Apply friction
      player.velocityX *= FRICTION;
      player.velocityZ *= FRICTION;

      // Update positions
      if (Math.abs(player.velocityX) > 0.01 || Math.abs(player.velocityZ) > 0.01) {
        player.x = this.quantizePosition(player.x + player.velocityX * dt);
        player.z = this.quantizePosition(player.z + player.velocityZ * dt);
      } else {
        player.velocityX = 0;
        player.velocityZ = 0;
      }
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

  private getRandomPosition() {
    return {
      x: this.quantizePosition((Math.random() - 0.5) * LOBBY_SIZE),
      y: 5, // Fixed height for all players
      z: this.quantizePosition((Math.random() - 0.5) * LOBBY_SIZE)
    };
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

    // Create player state with assigned color and random position
    const player = new PlayerState(color);
    const position = this.getRandomPosition();
    player.x = position.x;
    player.y = position.y;
    player.z = position.z;

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
