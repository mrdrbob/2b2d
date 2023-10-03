import Component from "../Component";

export default class Weight implements Component {
  public static readonly NAME:string = 'Weight';
  name() { return Weight.NAME; }

  constructor(public gravity:number) {}
}