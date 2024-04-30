import { Direction } from "../Components/MappedInput";
import { System } from "../System";
import Resource from "./Resource";

export default class KeysResource implements Resource {
  static readonly NAME: string = 'KeysResource';
  readonly name = KeysResource.NAME;

  private dirty: boolean = false;
  private lastFrame: Set<string> = new Set<string>();
  private thisFrame: Set<string> = new Set<string>();
  private connectedGamePads = new Set<number>();

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.thisFrame.add(e.key);
      this.dirty = true;
    }, false);

    window.addEventListener("keyup", (e) => {
      this.thisFrame.delete(e.key);
      this.dirty = true;
    }, false);

    // TODO: Send gamepad connected / disconnected signals
    window.addEventListener('gamepadconnected', (e) => {
      this.connectedGamePads.add(e.gamepad.index);
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      this.connectedGamePads.delete(e.gamepad.index);
    });
  }

  system(): System {
    return (_update) => {
      if (!this.dirty) { return; }
      this.lastFrame = new Set<string>(this.thisFrame);
      this.dirty = false;
    };
  }

  isKeyDown(key: string) {
    return this.thisFrame.has(key);
  }

  keyJustReleased(key: string): boolean {
    return !this.thisFrame.has(key) && this.lastFrame.has(key);
  }

  gamepadButtonPressed(gamepadIndex: number, buttonIndex: number) {
    if (!this.connectedGamePads.has(gamepadIndex))
      return false;

    const pad = navigator.getGamepads()[gamepadIndex];
    if (!pad || buttonIndex >= pad.buttons.length)
      return false;

    const button = pad.buttons[buttonIndex];
    return button.pressed;
  }

  gamepadAxisPressed(gamepadIndex: number, axisIndex: number, direction: Direction, threshold: number) {
    if (!this.connectedGamePads.has(gamepadIndex))
      return false;

    const pad = navigator.getGamepads()[gamepadIndex];
    if (!pad || axisIndex >= pad.axes.length)
      return false;

    const axis = pad.axes[axisIndex];
    if (direction == Direction.Positive && axis > threshold) {
      return true;
    }

    if (direction == Direction.Negative && axis < -threshold) {
      return true;
    }

    return false;
  }
}
