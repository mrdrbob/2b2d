import Component from "../Engine/Component";
import Position from "../Engine/Components/Position";
import { Entity } from "../Engine/Entity";
import GameEngineBuilder from "../Engine/GameEngine";
import Vec2 from "../Engine/Math/Vec2";
import { SystemsRunner } from "../Engine/System";
import Update from "../Engine/Update";
import Events from "../Events";

export class CurtainDoneEvent {
  constructor(public entity:Entity, public curtain:Curtain) {}
}

export interface OnCompleteArg {
  update:Update,
  component: Curtain,
  entity:Entity
}

export class Curtain implements Component {
  public static readonly NAME:string = 'Curtain';
  name() { return Curtain.NAME; }

  public time:number = 0;
  public active:boolean = true;

  constructor(public source:Vec2, public destination:Vec2, public totalTime:number, public onComplete?:(arg:OnCompleteArg) => void) { }

  public static readonly DespawnAfter:(arg:OnCompleteArg) => void = function ({ update, entity }) { update.despawn(entity); }

  public continue(destination:Vec2, totalTime:number, onComplete?:(arg:OnCompleteArg) => void) {
    this.source = this.destination;
    this.destination = destination;
    this.time = 0;
    this.totalTime = totalTime;
    this.onComplete = onComplete;
    this.active = true;
  }
}

export function tweenCurtain(update:Update) {
  var curtains = update.query([Curtain.NAME, Position.NAME]);
  for (const entity of curtains) {
    const [ curtain, position ] = entity.components as [ Curtain, Position ];
    if (!curtain.active)
      continue;

    if (curtain.time > curtain.totalTime) {
      curtain.active = false;
      if (curtain.onComplete)
        curtain.onComplete({ update, entity: entity.entity, component: curtain });
      continue;
    } else {
      curtain.time += update.deltaTime();
    }

    const diff = curtain.destination.sub(curtain.source);
    const percent = curtain.time / curtain.totalTime;
    const pos = curtain.source.add(diff.scalarMultiply(percent));
    position.pos = pos;
  }
}

export function addCurtain(builder:GameEngineBuilder) {
  builder.systems.update(SystemsRunner.ALWAYS_STATE, tweenCurtain);
  builder.events.register<CurtainDoneEvent>(Events.CURTAIN_COMPLETE);
}
