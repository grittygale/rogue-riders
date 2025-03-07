import { Schema, type, MapSchema } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") color: string;
  @type("number") x: number = 0;
  @type("number") y: number = 5; // Starting height
  @type("number") z: number = 0;
  @type("number") velocityX: number = 0;
  @type("number") velocityZ: number = 0;
  @type("number") mass: number = 1; // All balls have same mass for now
  @type("number") lastCollisionTime: number = 0;

  constructor(color: string) {
    super();
    this.color = color;
  }
}

export class MyRoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}
