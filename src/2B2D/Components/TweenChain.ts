import Component from "../Component";
import { ResolvableEntity } from "../Entity";
import Color from "../Math/Color";
import Vec2 from "../Math/Vec2";
import Signal from "../Signal";

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

export default class TweenChain implements Component {
  static readonly NAME: string = 'TweenChain';
  readonly name: string = TweenChain.NAME;

  constructor(
    public steps: Step[],
    public entity?: ResolvableEntity,
    public signal?: Signal,
  ) { }

  time: number = 0;

  static build(step?: (builder: TweenStepItemBuilder) => void) {
    const builder = new TweenStepItemBuilder({ time: 0, color: undefined, position: undefined, scale: undefined, radians: undefined });
    if (step)
      step(builder);
    return new ChainBuilder(builder.item);
  }
}

export class ChainBuilder {
  steps: Step[] = [];
  time: number = 0;

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

  chain(entity?: ResolvableEntity, signal?: Signal): TweenChain { return new TweenChain(this.steps, entity, signal); }
}

export class TweenStepItemBuilder {
  constructor(public item: StepItem) {

  }

  pos(pos: Vec2) { this.item.position = pos; return this; }
  color(color: Color) { this.item.color = color; return this; }
  scale(scale: Vec2) { this.item.scale = scale; return this; }
  rotation(radians: number) { this.item.radians = radians; return this; }
}
