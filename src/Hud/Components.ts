import Component from "../Engine/Component";

export class Hud implements Component {
  public static readonly NAME:string = 'Hud';
  name() { return Hud.NAME; }

  private constructor () { }
  public static readonly TAG:Hud = new Hud();
}
