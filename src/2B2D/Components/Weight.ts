import Component from "./Component";

export default class Weight implements Component {
  static readonly NAME:string = 'Weight';
  readonly name:string = Weight.NAME;

  constructor(public gravity:number) { }
}