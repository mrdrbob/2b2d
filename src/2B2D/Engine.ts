import { Command } from "./Command";
import { Layer } from "./Layer";
import Renderer from "./Rendering/Renderer";
import RenderingSystem from "./Rendering/RenderingSystem";
import Resource from "./Resource";
import Signal, { SignalHandler } from "./Signal";
import { State } from "./State";
import { Schedule, System } from "./System";
import Ticker from "./Ticker";
import Update from "./Update";
import World from "./World";


export default class Engine {
  private tick: (time: number) => void;
  private lastTick: number = 0;
  public run: boolean = false;

  public world = new World();
  public resources = new Map<string, Resource>();

  public static readonly ALWAYS_STATE: State = 'Always';
  public static readonly SCHEDULE_EXECUTION_ORDER: Schedule[] = ['entering', 'update', 'exiting'];
  public state = new Map<Schedule, Set<State>>();
  public systems = new Map<Schedule, Map<State, System[]>>;

  public signals = new Map<string, Signal[]>();

  public handlers = new Map<string, SignalHandler[]>();

  public layers = new Array<Layer>();

  public rendering = new RenderingSystem();

  public renderers = new Map<string, Renderer>();

  public tickers = new Array<Ticker>();

  constructor() {
    this.state.set('update', new Set<State>([Engine.ALWAYS_STATE]));
    this.state.set('entering', new Set<State>());
    this.state.set('exiting', new Set<State>());

    this.systems.set('update', new Map<string, System[]>());
    this.systems.set('entering', new Map<string, System[]>());
    this.systems.set('exiting', new Map<string, System[]>());

    this.tick = (time) => {
      if (!this.run)
        return;

      const delta = time - this.lastTick;
      this.lastTick = time;
      this.update(delta);

      requestAnimationFrame(this.tick);
    };
  }

  start() {
    this.lastTick = performance.now();
    this.run = true;
    requestAnimationFrame(this.tick);
  }

  stop() {
    this.run = false;
  }

  processCommands(commands: Array<Command>) {
    const exitingStates = this.state.get('exiting')!;
    const updateStates = this.state.get('update')!;
    const enteringStates = this.state.get('entering')!;

    for (const command of commands) {
      switch (command.type) {
        case 'spawn':
          const entity = this.world.spawn();
          for (const component of command.components) {
            this.world.add(entity, component);
          }
          command.resolvable.resolve(entity);
          break;
        case 'despawn':
          this.world.despawn(command.entity);
          break;
        case 'enter-state':
          enteringStates.add(command.state);
          break;
        case 'exit-state':
          const stateExists = updateStates.has(command.state);
          if (stateExists) {
            updateStates.delete(command.state);
            exitingStates.add(command.state);
          }
          break;
        case 'signal':
          let signalsSet = this.signals.get(command.signal.name);
          if (!signalsSet) {
            signalsSet = new Array<Signal>();
            this.signals.set(command.signal.name, signalsSet);
          }
          signalsSet.push(command.signal);
          break;
        case 'add-renderer':
          const renderer = command.create(this.rendering);
          this.renderers.set(renderer.name, renderer);
          break;
        case 'remove-renderer':
          const toDelete = this.renderers.get(command.name);
          if (toDelete) {
            this.renderers.delete(command.name);
            toDelete.cleanup();
          }
          break;
        case 'add-resource':
          this.resources.set(command.resource.name, command.resource);
          break;
        case 'add-ticker':
          this.tickers.push(command.ticker);
          break;
      }
    }
  }

  update(delta: number) {
    let commands: Array<Command> = [];

    // Build update context
    const update = new Update({
      world: this.world,
      commands: commands,
      resources: this.resources,
      delta: delta,
      signals: this.signals,
      renderers: this.renderers,
      rendering: this.rendering,
      layers: this.layers,
    });

    // Trigger any signals handlers first
    for (const [name, val] of this.signals) {
      const handlers = this.handlers.get(name);
      if (!handlers)
        continue;

      for (const hander of handlers) {
        hander(update, val);
      }
    }

    // Execute all scheduled systems
    for (const schedule of Engine.SCHEDULE_EXECUTION_ORDER) {
      const systemsInSchdule = this.systems.get(schedule)!;

      for (const state of this.state.get(schedule)!) {
        const systems = systemsInSchdule.get(state);
        if (!systems || systems.length == 0)
          continue;
        for (const sys of systems) {
          sys(update);
        }
      }
    }

    // Render
    this.rendering.draw(update);

    // Tick anything that requires a tick
    for (const ticker of this.tickers) {
      ticker.tick(update);
    }

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

    // Clear out any fired signals.
    // Array will be re-filled by processCommands
    this.signals.clear();

    // Now process commands for the next frame.
    this.processCommands(commands);
  }
}
