import Resource from "../Resource";
import Ticker from "../Ticker";

export class KeysResource implements Resource, Ticker {
  name = 'Keys';

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

export default function Keys() { return new KeysResource(); }
