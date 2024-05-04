import Update from "../Update";
import Component from "./Component";

export enum Direction {
  Positive,
  Negative
}

export type GamepadAxisPress = {
  type: 'gamepad-axis-press',
  axis: number,
  direction: Direction,
  threshold: number
};

export type GamepadButtonPress = {
  type: 'gamepad-button-press',
  button: number
}

export type KeyboardPress = {
  type: 'keyboard-press',
  code: string
}

export type PressEvent = GamepadAxisPress | GamepadButtonPress | KeyboardPress;

export default class MappedInput implements Component {
  static readonly NAME: string = 'MappedInput';
  readonly name: string = MappedInput.NAME;

  /** Builds a MappedInput component. Provides a convenient(ish) interface for mapping 
   * keyboard and gamepda controller inputs to actions (strings)
  */
  static build(gampeadIndex: number, action: (builder: MappedInputBuilder) => void) {
    var builder = new MappedInputBuilder();
    action(builder);
    return builder.asComponent(gampeadIndex);
  }

  constructor(public gamepadIndex: number, public inputMap: Map<string, Array<PressEvent>>) { }

  isPressed(update: Update, action: string) {
    const keys = update.keys();

    const mappings = this.inputMap.get(action);
    if (!mappings || mappings.length == 0)
      return false;

    for (const event of mappings) {
      switch (event.type) {
        case 'keyboard-press':
          if (keys.isKeyDown(event.code))
            return true;
          break;
        case 'gamepad-button-press':
          if (keys.gamepadButtonPressed(this.gamepadIndex, event.button))
            return true;
          break;
        case 'gamepad-axis-press':
          if (keys.gamepadAxisPressed(this.gamepadIndex, event.axis, event.direction, event.threshold))
            return true;
          break;
      }
    }

    return false;
  }
}

export class MappedInputBuilder {
  private map = new Map<string, Array<PressEvent>>();

  set(action: string, press: PressEvent) {
    const presses = this.map.get(action);
    if (!presses) {
      this.map.set(action, [press]);
    } else {
      presses.push(press);
    }

    return this;
  }

  for(action: string, config: (builder: MappedInputActionBuilder) => void) {
    var builder = new MappedInputActionBuilder(this, action);
    config(builder);
    return this;
  }

  get() { return this.map; }

  asComponent(gamepadIndex: number) {
    return new MappedInput(gamepadIndex, this.map);
  }
}

export class MappedInputActionBuilder {
  constructor(private parent: MappedInputBuilder, private action: string) { }

  keyboard(code: string) {
    this.parent.set(this.action, { type: 'keyboard-press', code: code });
    return this;
  }

  button(button: number) {
    this.parent.set(this.action, { type: "gamepad-button-press", button });
    return this;
  }

  axis(axis: number, threshold: number, direction: Direction) {
    this.parent.set(this.action, { type: 'gamepad-axis-press', axis, threshold, direction });
    return this;
  }

  negative(axis: number, threshold: number) {
    return this.axis(axis, threshold, Direction.Negative);
  }

  positive(axis: number, threshold: number) {
    return this.axis(axis, threshold, Direction.Positive);
  }
}
