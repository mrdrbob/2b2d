import Component from "../Component";
import { ResolvableEntity } from "../Entity";
import Color from "../Math/Color";
import Vec2 from "../Math/Vec2";
import Signal from "../Signal";

export interface StepItem {
  time: number,
  position: Vec2 | undefined,
  color: Color | undefined,
  scale: Vec2 | undefined
}

export interface Step {
  start: StepItem,
  end: StepItem
}

export interface TweenChainComponent extends Component {
  name: 'TweenChain',
  entity: ResolvableEntity | undefined,
  steps: Step[],
  signal: Signal | undefined,
  time: number
}

/** An alternative to using a single Tween / Timer combo. You can chain a series of tweens 
 * that all work on the same entity together. Use `TweenChainBuilder.start` for a more convenient 
 * interface for building chains of tweens. Will despawn itself after the tween chain is complete.
 * If you want to effect an entity without despawning it, use `entity` to point to that entity.
 * Can optionally send a `signal` at despawn time.
 */
export default function TweenChain(steps: Step[], entity?:ResolvableEntity, signal?:Signal) : TweenChainComponent {
  return {
    name: 'TweenChain',
    entity,
    signal,
    steps: steps,
    time: 0
  };
}

export class TweenStepItemBuilder {
  constructor(public item: StepItem) {

  }

  pos(pos:Vec2) { this.item.position = pos; return this; }
  color(color:Color) { this.item.color = color; return this; }
  scale(scale:Vec2) { this.item.scale = scale; return this; }
}

export class TweenChainBuilder {
  steps: Step[] = [];
  time: number = 0;

  constructor(private last:StepItem) {

  }

  static start(step?:(builder:TweenStepItemBuilder) => void) {
    const builder = new TweenStepItemBuilder({ time: 0, color: undefined, position: undefined, scale: undefined });
    if (step)
      step(builder);
    return new TweenChainBuilder(builder.item);
  }

  andThen(time:number, step?:(builder:TweenStepItemBuilder) => void) {
    const startTime = this.time;
    this.time += time;
    const builder = new TweenStepItemBuilder({ time: this.time, color: this.last.color, position: this.last.position, scale: this.last.scale });
    if (step)
      step(builder);
    this.steps.push({
      start: {
        time: startTime,
        position: this.last.position,
        color: this.last.color,
        scale: this.last.scale
      },
      end: builder.item
    });

    return this;
  }
}
