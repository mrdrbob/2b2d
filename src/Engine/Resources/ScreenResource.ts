import Vec2 from "../Math/Vec2";
import Resource from "../Resource";

export default class ScreenResource implements Resource {
  public static readonly NAME:string = 'ScreenResource';
  name() { return ScreenResource.NAME; }

  constructor(public screenSize:Vec2, devicePixelRatio:number) { }
}