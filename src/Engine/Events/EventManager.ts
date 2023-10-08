export interface UntypedEvent {
  tick(): void;
}

export class Event<T> implements UntypedEvent {
  private events:T[] = [];
  private pending:T[] = [];

  tick() {
    if (this.events.length == 0 && this.pending.length == 0)
      return;
    
    this.events = this.pending;
    this.pending = [];
  }

  read() { return this.events; }

  push(value:T) { this.pending.push(value); }
}

export default class EventManager {
  private events:Map<string, UntypedEvent> = new Map<string, UntypedEvent>();

  register<T>(name:string) : Event<T> {
    const event = new Event<T>();
    this.events.set(name, event);
    return event;
  }

  get<T>(name:string) {
    const event = this.events.get(name);
    if (!event)
      return undefined;
    return event as Event<T>;
  }

  assume<T>(name:string) {
    return this.events.get(name)! as Event<T>;
  }

  tick() {
    for (const ev of this.events.values()) {
      ev.tick();
    }
  }
}