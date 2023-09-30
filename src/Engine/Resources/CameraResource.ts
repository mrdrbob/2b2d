import Vec2 from "../Math/Vec2";
import Resource from "../Resource";

export default class CameraResource implements Resource {
  public static NAME:string = 'CameraResource';
  name(): string { return CameraResource.NAME; }
  
  public position:Vec2 = Vec2.ZERO;
}
