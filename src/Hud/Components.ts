import Component from "../Engine/Component";


export class HealthDisplay implements Component {
  public static readonly NAME:string = 'HealthDisplay';
  name() { return HealthDisplay.NAME; }

  constructor (public empty:number, public half:number, full:number) {}
}
