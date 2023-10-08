import Component from "../Component";
import { Entity } from "../Entity";
import Vec2 from "../Math/Vec2";
import Update from "../Update";
import Position from "./Position";
import Sprite from "./Sprite";

export interface OnCompleteArg {
  update:Update,
  component: Tween,
  entity:Entity
}

export default class Tween implements Component {
  public static NAME:string = 'Tween';
  name() { return Tween.NAME; }

  public time:number = 0;
  public active:boolean = true;

  constructor(public totalTime:number, public onUpdate:(progress:number) => void, public onComplete?:(arg:OnCompleteArg) => void) { }

  public static readonly DespawnAfter:(arg:OnCompleteArg) => void = function ({ update, entity }) { update.despawn(entity); }

  public continuePositionAndAlpha(totalTime:number, position:Position, sprite:Sprite, goalPosition:Vec2, goalAlpha: number, onComplete?:(arg:OnCompleteArg) => void) {
    const startPosition = position.pos;
    const startAlpha = sprite.color[3];

    this.onUpdate = (percent:number) => {
      const posDiff = goalPosition.sub(startPosition).scalarMultiply(percent);
      const alphaDiff = (goalAlpha - startAlpha) * percent;

      position.pos = startPosition.add(posDiff);
      sprite.color[3] = startAlpha + alphaDiff;
    };
    
    this.time = 0;
    this.totalTime = totalTime;
    this.onComplete = onComplete;
    this.active = true;
  }

  public static PositionAndAlpha(totalTime:number, position:Position, sprite:Sprite, goalPosition:Vec2, goalAlpha: number, onComplete?:(arg:OnCompleteArg) => void) {
    const startPosition = position.pos;
    const startAlpha = sprite.color[3];

    function progress(percent:number) {
      const posDiff = goalPosition.sub(startPosition).scalarMultiply(percent);
      const alphaDiff = (goalAlpha - startAlpha) * percent;

      position.pos = startPosition.add(posDiff);
      sprite.color[3] = startAlpha + alphaDiff;
    }

    return new Tween(totalTime, progress, onComplete);
  }
}
