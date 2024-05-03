import { Entity } from "../Entity";
import Color from "../Math/Color";
import Vec2 from "../Math/Vec2";
import Signal from "../Signal";
import Future from "../Util/Future";
import Component from "./Component";

export interface StepItem {
  time: number,
  position: Vec2 | undefined,
  color: Color | undefined,
  scale: Vec2 | undefined,
  radians: number | undefined
}

export interface Step {
  start: StepItem,
  end: StepItem
}


export class ChainBuilder {
  steps: Step[] = [];
  time: number = 0;
  private _entity: Entity | Future<Entity> | undefined = undefined;
  private _signal: Signal | undefined = undefined;
  private _loop: boolean = false;

  constructor(private last: StepItem) {

  }

  andThen(time: number, step?: (builder: TweenStepItemBuilder) => void) {
    const startTime = this.time;
    this.time += time;
    const builder = new TweenStepItemBuilder({ time: this.time, color: this.last.color, position: this.last.position, scale: this.last.scale, radians: this.last.radians });
    if (step)
      step(builder);
    this.steps.push({
      start: {
        time: startTime,
        position: this.last.position,
        color: this.last.color,
        scale: this.last.scale,
        radians: this.last.radians
      },
      end: builder.item
    });

    return this;
  }

  entity(entity: Future<Entity> | Entity) {
    this._entity = entity;
    return this;
  }

  signal(signal: Signal) {
    this._signal = signal;
    return this;
  }

  loop(loop: boolean) {
    this._loop = loop;
    return this;
  }

  chain(): SpriteTween { return new SpriteTween(this.steps, this._entity, this._signal, this._loop); }
}

export class TweenStepItemBuilder {
  constructor(public item: StepItem) {

  }

  pos(pos: Vec2) { this.item.position = pos; return this; }
  color(color: Color) { this.item.color = color; return this; }
  scale(scale: Vec2) { this.item.scale = scale; return this; }
  rotation(radians: number) { this.item.radians = radians; return this; }
}

/** Animates a sprite through a series of points. Will despawn the entity
 * to which it is attached at the end of the series. To keep the sprite,
 * use the `entity` argument to point to another entity, which will not 
 * be despawned.
 */
export default class SpriteTween implements Component {
  static readonly NAME: string = 'SriteTween';
  readonly name: string = SpriteTween.NAME;

  /** Constructs a SpriteTween, which can animate several properties of a 
   * sprite over time and over several steps. Generally best to use the 
   * `SpriteTween.build()` helper to construct tweens.
   */
  constructor(
    public steps: Step[],
    public entity?: Future<Entity> | Entity,
    public signal?: Signal,
    public loop?: boolean
  ) { }

  time: number = 0;

  /** Constructs a SpriteTween. Builds a series of steps, each relative to the previous
   * step. Can track another entity, or tween the entity to which it is attached. Can optionally
   * send a signal on completion. Can also indefinitely loop.
   * NOTE: If the tween doesn't loop, the entity the `SpriteTween` component is attached to
   * will be despawned at the end of the animation.
   */
  static build(step?: (builder: TweenStepItemBuilder) => void) {
    const builder = new TweenStepItemBuilder({ time: 0, color: undefined, position: undefined, scale: undefined, radians: undefined });
    if (step)
      step(builder);
    return new ChainBuilder(builder.item);
  }
}