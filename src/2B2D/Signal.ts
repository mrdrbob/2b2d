import Update from "./Update";

export default interface Signal {
  name: string,
  sender: string | undefined
}

export type Handler = (update: Update, signals: Signal[]) => void;

export type TypedHandler<T extends Signal> = (update: Update, signals: T[]) => void;
