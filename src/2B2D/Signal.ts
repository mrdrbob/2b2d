import Update from "./Update";

export default interface Signal {
  name: string,
  sender: string | undefined
}

export type SignalHandler = (update: Update, signals: Signal[]) => void;
