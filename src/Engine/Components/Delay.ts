import Component from "../Component";
import Update from "../Update";

export default class Delay implements Component {
  public static readonly NAME:string = 'Delay';
  name() { return Delay.NAME; }

  constructor(public time:number, public andThen:(update:Update) => void) { }
}