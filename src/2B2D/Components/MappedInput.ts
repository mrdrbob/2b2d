import Component from "../Component";
import Update from "../Update";

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
