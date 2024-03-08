import Component from "../../../2B2D/Component";
import Vec2 from "../../../2B2D/Math/Vec2";

export default class Bat implements Component {
  static readonly NAME:string = 'Bat';
  readonly name:string = Bat.NAME;

  constructor(bottom: Vec2, top: Vec2) {
    this.transitions = [
      { start: bottom, end: bottom, startTime: 0, endTime: 1000 },
      { start: bottom, end: top, startTime: 1000, endTime: 2000 },
      { start: top, end: top, startTime: 2000, endTime: 3000 },
      { start: top, end: bottom, startTime: 3000, endTime: 4000 },
    ];
  }

  transitions: Array<{ start: Vec2; end: Vec2; startTime: number; endTime: number; }>;
  time: number = 0;
  totalTime: number = 4000;
}