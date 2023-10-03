import Component from "../Component";

export default class Camera implements Component {
  public static NAME:string = 'Camera';
  name() { return Camera.NAME; }

  private constructor() {}
  public static readonly TAG:Camera = new Camera();
}
