import Component from "../../Engine/Component";
import Vec2 from "../../Engine/Math/Vec2";

export class Bat implements Component {
  public static readonly NAME:string = 'Bat';
  transitions: { start: Vec2; end: Vec2; startTime: number; endTime: number; }[];
  name() { return Bat.NAME; }

  public time:number = 0;
  public totalTime:number = 4000;

  constructor(bottom:Vec2, top:Vec2) {
    this.transitions = [
      { start: bottom, end: bottom, startTime: 0, endTime: 1000 },
      { start: bottom, end: top, startTime: 1000, endTime: 2000 },
      { start: top, end: top, startTime: 2000, endTime: 3000 },
      { start: top, end: bottom, startTime: 3000, endTime: 4000 },
    ];
  }
}

// An enemy is something that is stompable, but will damage the player if the player hits the enemy from any way but the top.
export class Enemy implements Component {
  public static readonly NAME:string = 'Enemy';
  name() { return Enemy.NAME; }

  public hitCoolDown:number = 0;
  constructor(public damageToDo:number, public hitBox:Vec2) { }
}
