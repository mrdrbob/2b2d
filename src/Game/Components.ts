import Component from "../Engine/Component";

export class CleanupOnGameLoopExit implements Component {
  public static NAME:string = 'CleanupOnGameLoopExit'
  name() { return CleanupOnGameLoopExit.NAME; }
}
