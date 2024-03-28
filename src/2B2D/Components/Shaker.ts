import Component from "../Component";

export default class Shaker implements Component {
  static readonly NAME:string = 'Shaker';
  readonly name:string = Shaker.NAME;

  constructor(public shakeTime:number, public strength:number, public speed:number = 1) {}

  timeRemaining:number = 0;

  offset:number = 1;

  shake() {
    this.offset += Math.random() * 13;
    this.timeRemaining = this.shakeTime;
  }
}