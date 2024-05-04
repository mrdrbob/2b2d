import { Command } from "./Command";
import Component from "./Components/Component";
import Engine from "./Engine";
import { NamedTypeClass } from "./NamedType";
import RenderingSystem from "./Rendering/RenderingSystem";
import AssetsResource from "./Resources/AssetsResource";
import AudioResource from "./Resources/AudioResource";
import KeysResource from "./Resources/KeysResource";
import Resource from "./Resources/Resource";
import { Schedule } from "./Schedule";
import Scheduler from "./Scheduler";
import Signal, { Handler, TypedHandler } from "./Signal";
import { System } from "./System";
import AnimateSprites from "./Systems/AnimateSprites";
import AnimateTilemaps from "./Systems/AnimateTilemaps";
import ShakeShakers from "./Systems/ShakeShakers";
import UpdateSpriteTweens from "./Systems/UpdateSpriteTweens";
import UpdateStateMachines from "./Systems/UpdateStateMachines";
import UpdateTimelines from "./Systems/UpdateTimelines";

export default class Builder {
  constructor(public engine: Engine) { }

  static async create(width: number, height: number) {
    const adapter = await navigator.gpu?.requestAdapter();
    const device = await adapter?.requestDevice()!;

    const rendering = new RenderingSystem(device, width, height);
    const engine = new Engine(rendering);
    return new Builder(engine);
  }

  /** Executes the `plugin` to add it to the engine. */
  plugin(plugin: (builder: Builder) => void) {
    plugin(this);
    return this;
  }

  private _schedule(schedule: Schedule, state: string, system: System) {
    const systemsInSchedule = this.engine.scheduler.systems.get(schedule)!;
    const systemsInState = systemsInSchedule.get(state);
    if (systemsInState) {
      systemsInState.push(system);
    } else {
      systemsInSchedule.set(state, [system]);
    }
    return this;
  }

  schedule = {
    /** Schedules `system` to run once when entering `state` */
    enter: (state: string, system: System) => { return this._schedule('entering', state, system); },

    /** Schedules `system` to run every frame during the update phase of `state` */
    exit: (state: string, system: System) => { return this._schedule('exiting', state, system); },

    /** Schedules `system` to run once when exiting `state` */
    update: (state: string, system: System) => { return this._schedule('update', state, system); },

    /** Schedules `system` to every frame through the entire game lifecycle */
    always: (system: System) => { return this._schedule('update', Scheduler.ALWAYS_STATE, system); },

    /** Despawns any entities with `tag` when `state` exits. */
    cleanup: (state: string, component: NamedTypeClass<Component>) => {
      return this._schedule('exiting', state, (update) => {
        const query = update.ecs.query(component);
        for (const item of query) {
          update.despawn(item.entity);
        }
      });
    }
  }

  signals = {
    /** Registers a `handler` for a given `signal` */
    handle: <T extends Signal>(signal: NamedTypeClass<T> | string, handler: Handler | TypedHandler<T>) => {
      let signalName: string;

      if (typeof signal === 'string') {
        signalName = signal;
      } else {
        signalName = signal.NAME;
      }

      let handlers = this.engine.dispatcher.handlers.get(signalName);
      if (!handlers) {
        handlers = new Array<Handler>();
        this.engine.dispatcher.handlers.set(signalName, handlers);
      }

      handlers.push(handler as Handler);
      return this;
    }
  }

  /** Registers a resource for use during game execution */
  resource(resource: Resource) {
    this.engine.resources.set(resource.name, resource);
  }

  /** Adds a command to be executed prior to the first frame. Useful for
   * entering the first state, adding rendering systems, etc.
   */
  command(command: Command) {
    this.engine.commands.push(command);
    return this;
  }

  /** Set a state to be active (entered) when the engine first boots up. Can
   * be called multiple times for multiple states
   */
  startState(state: string) {
    this.command({ type: 'enter-state', state });
  }

  /** Finishes intializing an `Engine`.
   * If you don't want default resources and systems, pass 
   * `false` for `skipDefaults`.
   */
  async finish(skipDefaults?: boolean) {
    if (!skipDefaults) {
      // Default systems
      this.schedule.always(UpdateSpriteTweens);
      this.schedule.always(AnimateSprites);
      this.schedule.always(UpdateTimelines);
      this.schedule.always(UpdateStateMachines);
      this.schedule.always(AnimateTilemaps);
      this.schedule.always(ShakeShakers);

      // Default commands
      this.engine.commands.push({
        type: 'add-resource',
        resource: new AssetsResource()
      });

      const keysResource = new KeysResource();
      this.engine.commands.push({
        type: 'add-resource',
        resource: keysResource
      });
      this.engine.commands.push({
        type: 'add-fixed-system',
        system: keysResource.system()
      });
      const audioResource = new AudioResource();
      this.engine.commands.push({
        type: 'add-resource',
        resource: audioResource
      });
      this.engine.commands.push({
        type: 'add-fixed-system',
        system: audioResource.system()
      });
    }

    this.engine.commands.execute(this.engine);

    return this.engine;
  }

}