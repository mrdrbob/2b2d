import Signal, { Handler } from "./Signal";
import Update from "./Update";

export default class Dispatcher {
  signals = new Map<string, Signal[]>();
  handlers = new Map<string, Handler[]>();

  next(update: Update) {
    for (const [name, signals] of this.signals) {
      const handlers = this.handlers.get(name);
      if (!handlers)
        continue;
      for (const handler of handlers) {
        handler(update, signals);
      }
    }

    this.signals.clear();
  }
}