import { Entity } from "../../../2B2D/Entity";
import Signal from "../../../2B2D/Signal";

export default class EnemyCollision implements Signal {
  static readonly NAME: string = 'EnemyCollision';
  readonly name: string = EnemyCollision.NAME;

  constructor(
    public enemy: Entity,
    public damage: number,
    public isStomp: boolean,
    public sender: string | undefined = undefined
  ) { }
}