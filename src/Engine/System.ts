import Update from "./Update";

export type System = (args: Update) => void;

export enum SystemSchedule {
  Enter,
  Update,
  Exit
}

export class SystemsBuilder {
  private systems:Array<System> = [];
  private scheduled:Array<{ schedule: SystemSchedule, state:string, system: number }> = [];
  
  registerSystem(system:System) {
    const id = this.systems.length;
    this.systems.push(system);
    return id;
  }

  schedule(schedule: SystemSchedule, state:string, system: number): number {
    this.scheduled.push({ schedule, state, system });
    return system;
  }

  enter(state:string, system:System) {
    return this.schedule(SystemSchedule.Enter, state, this.registerSystem(system));
  }

  exit(state:string, system:System) {
    return this.schedule(SystemSchedule.Exit, state, this.registerSystem(system));
  }

  update(state:string, system:System) {
    return this.schedule(SystemSchedule.Update, state, this.registerSystem(system));
  }

  /*
  unschedule(schedule: SystemSchedule, state:string, system: number) {
    const index = this.scheduled.findIndex(x => x.schedule == schedule && x.state == state && x.system == system);
    if (index < 0)
      return false;
    this.scheduled.slice(index, 1);
    return true;
  }
  */

  finish() {
    return new SystemsRunner(this.systems, this.scheduled);
  }
}

export class SystemsRunner {
  public static readonly ALWAYS_STATE:string = 'Always';

  private systems:Array<System>;
  private schedule:Map<SystemSchedule, Map<string, Array<number>>>;
  
  // A list of states currently in each schedule
  private updates:Set<string> = new Set<string>([ SystemsRunner.ALWAYS_STATE ]);
  private enters:Set<string> = new Set<string>();
  private exits:Set<string> = new Set<string>();

  // A cached list of systems to run
  private running:Array<System> = []; 

  constructor(systems:Array<System>, scheduled:Array<{ schedule: SystemSchedule, state: string, system: number }>) {
    this.systems = systems;
    this.schedule = new Map<SystemSchedule, Map<string, Array<number>>>();

    this.schedule.set(SystemSchedule.Enter, new Map<string, Array<number>>());
    this.schedule.set(SystemSchedule.Exit, new Map<string, Array<number>>());
    this.schedule.set(SystemSchedule.Update, new Map<string, Array<number>>());

    for (const { schedule, state, system } of scheduled) {
      const scheduleMap = this.schedule.get(schedule)!;
      let systems = scheduleMap.get(state);
      if (!systems) {
        systems = [];
        scheduleMap.set(state, systems);
      }
      systems.push(system);
    }
  }

  getRunning() { return this.running; }

  update(entering:Set<string>, exiting:Set<string>) {
    // Bail early if nothing changed
    if (entering.size == 0 && exiting.size == 0 && this.enters.size == 0 && this.exits.size == 0) {
      return;
    }
    
    // Add the "enter" systems to the "update" systems, remove any "exiting" systems
    for (const enter of this.enters) {
      this.updates.add(enter);
    }
    for (const exit of this.exits) {
      this.updates.delete(exit);
    }
    for (const exit of exiting) {
      this.updates.delete(exit);
    }

    // Track the new batch
    this.enters = new Set<string>(entering);
    this.exits = new Set<string>(exiting);

    // Rebuild the currently running list.
    const states = [
      { schedule: SystemSchedule.Enter, states: this.enters },
      { schedule: SystemSchedule.Update, states: this.updates },
      { schedule: SystemSchedule.Exit, states: this.exits },
    ];

    let runningSystemIds = states.flatMap(({ schedule, states }) => {
      const statesInThisSchedule = this.schedule.get(schedule)!;
      return [...states].flatMap((state) => {
        const systems = statesInThisSchedule.get(state);
        return systems || [];
      });
    });

    this.running = runningSystemIds.map(id => this.systems[id]);
  }
}
