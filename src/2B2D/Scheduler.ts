import { Schedule } from "./Schedule";
import { FixedSystem, System } from "./System";
import Update from "./Update";

export default class Scheduler {
  public static readonly ALWAYS_STATE = 'Always';
  public static readonly SCHEDULE_EXECUTION_ORDER: Schedule[] = ['entering', 'update', 'exiting'];
  public state = new Map<Schedule, Set<string>>();
  public systems = new Map<Schedule, Map<string, Array<System | FixedSystem>>>();


  constructor() {
    this.state.set('update', new Set<string>([Scheduler.ALWAYS_STATE]));
    this.state.set('entering', new Set<string>());
    this.state.set('exiting', new Set<string>());

    this.systems.set('update', new Map<string, Array<System | FixedSystem>>());
    this.systems.set('entering', new Map<string, Array<System | FixedSystem>>());
    this.systems.set('exiting', new Map<string, Array<System | FixedSystem>>());
  }

  enter(state: string) {
    this.state.get('entering')!.add(state);
  }

  exit(state: string) {
    const existed = this.state.get('update')!.delete(state);
    if (existed) {
      this.state.get('exiting')!.add(state);
    }
  }

  execute(update: Update, fixed: boolean) {
    for (const schedule of Scheduler.SCHEDULE_EXECUTION_ORDER) {
      const systemsInSchdule = this.systems.get(schedule)!;

      for (const state of this.state.get(schedule)!) {
        const systems = systemsInSchdule.get(state);
        if (!systems || systems.length == 0)
          continue;
        for (const sys of systems) {
          if (!fixed && typeof(sys) == 'function')
            sys(update);
          else if (fixed && typeof(sys) != 'function')
            sys.fixed(update);
        }
      }
    }
  }

  next() {
    // Process state changes
    const exitingStates = this.state.get('exiting')!;
    const updateStates = this.state.get('update')!;
    const enteringStates = this.state.get('entering')!;

    // Remove any exiting states
    exitingStates.clear();

    // Promote any entering states to `update`
    for (const state of enteringStates) {
      updateStates.add(state);
    }
    enteringStates.clear();
  }
}