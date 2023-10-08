import Component from "../Engine/Component";

export class CleanupOnGameLoopExit implements Component {
  public static NAME:string = 'CleanupOnGameLoopExit'
  name() { return CleanupOnGameLoopExit.NAME; }

  private constructor() { }
  public static readonly TAG:CleanupOnGameLoopExit = new CleanupOnGameLoopExit();
}
