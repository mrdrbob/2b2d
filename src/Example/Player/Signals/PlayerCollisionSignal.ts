import { Entity } from "../../../2B2D/Entity";
import Signal from "../../../2B2D/Signal";

export default class PlayerCollisionSignal implements Signal {
  static readonly NAME: string = 'PlayerCollisionSignal';
  readonly name: string = PlayerCollisionSignal.NAME;

  constructor(public sender: string, public damage: number, public player: Entity) { }
}