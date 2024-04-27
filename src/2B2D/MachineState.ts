import Update from "./Update";

/** Represents a state in a state machine */
export default interface MachineState {
  updateImmediately: boolean;

  enter(update: Update): void;

  update(update: Update): MachineState | undefined;
}
