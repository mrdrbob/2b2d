import Resource from "../Resource";
import Ticker from "../Ticker";

export default class KeysResource implements Resource, Ticker {
  static readonly NAME:string = 'KeysResource';
  readonly name = KeysResource.NAME;

  private dirty: boolean = false;
  private lastFrame: Set<string> = new Set<string>();
  private thisFrame: Set<string> = new Set<string>();

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.thisFrame.add(e.key);
      this.dirty = true;
    }, false);

    window.addEventListener("keyup", (e) => {
      this.thisFrame.delete(e.key);
      this.dirty = true;
    }, false);
  }

  tick() {
    if (!this.dirty) { return; }
    this.lastFrame = new Set<string>(this.thisFrame);
    this.dirty = false;
  }

  isKeyDown(key:string) {
    return this.thisFrame.has(key);
  }

  keyJustReleased(key:string): boolean {
    return !this.thisFrame.has(key) && this.lastFrame.has(key);
  }
}
