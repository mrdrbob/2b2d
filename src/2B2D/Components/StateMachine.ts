import MachineState from "../MachineState";
import Update from "../Update";
import Component from "./Component";

export default class StateMachine implements Component {
  static readonly NAME: string = 'StateMachine';
  readonly name: string = StateMachine.NAME;

  constructor(public state: MachineState) { }

  moveTo(update: Update, state: MachineState) {
    this.moveToRecursive(update, state, 10);
  }

  update(update: Update) {
    this.updateRecurisve(update, 10);
  }

  private updateRecurisve(update: Update, attemptsRemaining: number) {
    if (attemptsRemaining < 0)
      throw new Error('Too many attempts to stablize on new state');

    const newState = this.state.update(update);
    if (!newState)
      return;

    this.moveToRecursive(update, newState, attemptsRemaining);
  }

  private moveToRecursive(update: Update, newState: MachineState, attemptsRemaining: number) {
    this.state = newState;
    newState.enter(update);
    if (!newState.updateImmediately)
      return;

    this.updateRecurisve(update, attemptsRemaining - 1);
  }
}
