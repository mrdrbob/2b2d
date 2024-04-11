import { Command } from "./Command";
import Engine from "./Engine";
import { Layer } from "./Layer";
import Resource from "./Resource";
import AssetsResource from "./Resources/AssetsResource";
import AudioResource from "./Resources/AudioResource";
import KeysResource from "./Resources/KeysResource";
import { SignalHandler } from "./Signal";
import { State } from "./State";
import { Schedule, System } from "./System";
import AnimateSprites from "./Systems/AnimateSprites";
import AnimateTilemaps from "./Systems/AnimateTilemaps";
import ShakeShakers from "./Systems/ShakeShakers";
import UpdateStateMachines from "./Systems/UpdateStateMachines";
import UpdateTimers from "./Systems/UpdateTimers";
import UpdateTweenChains from "./Systems/UpdateTweenChains";
import Update from "./Update";

export default class Builder {
  private engine = new Engine();
  private commands = new Array<Command>();

  // I dunno. It just looks nicer. Like I'm adding a plugin
  // to the builder, even though the plugin is just a function.
  /**
   * Adds a plugin to the existing builder
   */
  plugin(plugin: (builder: Builder) => void) {
    plugin(this);
    return this;
  }

  /** Schdule a system for a particular schedule and state. Generally, use `enter`, `exit`, or `update`
   * methods instead. */
  schedule(schedule: Schedule, state: State, system: System) {
    const systemsInSchedule = this.engine.systems.get(schedule)!;
    const systemsInState = systemsInSchedule.get(state);
    if (systemsInState) {
      systemsInState.push(system);
    } else {
      systemsInSchedule.set(state, [system]);
    }
    return this;
  }

  /** Schedules `system` to run once when entering `state` */
  enter(state: State, system: System) { return this.schedule('entering', state, system); }

  /** Schedules `system` to run every frame during the update phase of `state` */
  exit(state: State, system: System) { return this.schedule('exiting', state, system); }

  /** Schedules `system` to run once when exiting `state` */
  update(state: State, system: System) { return this.schedule('update', state, system); }

  /** Schedules `system` to every frame through the entire game lifecycle */
  always(system: System) { return this.schedule('update', Engine.ALWAYS_STATE, system); }

  /** Despawns any entities with `tag` when `state` exits. */
  cleanup(state: State, tag: string) { return this.schedule('exiting', state, (u: Update) => { u.cleanUpTag(tag); }); }

  /** Registers a `handler` for a given `signal` */
  handle(signal: string, handler: SignalHandler) {
    let handlers = this.engine.handlers.get(signal);
    if (!handlers) {
      handlers = new Array<SignalHandler>();
      this.engine.handlers.set(signal, handlers);
    }
    handlers.push(handler);
    return this;
  }

  /** Registers a `handler` that will only respond to `signal` events from a given `sender`, and 
   * will assume the signal is singular (will not handle multiple signals, only the first)
   */
  handleFrom(signal: string, sender: string, handler: (update: Update) => void) {
    this.handle(signal, (update, signals) => {
      if (signals.length === 0)
        return;
      if (signals[0].sender !== sender)
        return;
      handler(update);
    });
  }

  /** Registers a `handler` that will only respond to `signal` events from a given `sender`, and 
   * will assume the signal is singular (will not handle multiple signals, only the first). Will
   * send the signal typed as T for convenience
   */
  handleFromTyped<T>(signal: string, sender: string, handler: (update: Update, signal: T) => void) {
    this.handle(signal, (update, signals) => {
      if (signals.length === 0)
        return;
      if (signals[0].sender !== sender)
        return;
      handler(update, signals[0] as T);
    });
  }

  /** Adds a `resource` to the engine */
  resource(resource: Resource) {
    this.engine.resources.set(resource.name, resource);
    return this;
  }

  /** Adds a `layer` to the engine. Layers are added in order, from 
   * back first, to front last
   */
  layer(layer: Layer) {
    this.engine.layers.push(layer);
    return this;
  }

  /** Adds a command to be executed prior to the first frame. Useful for
   * entering the first state, adding rendering systems, etc.
   */
  command(command: Command) {
    this.commands.push(command);
    return this;
  }


  /** Set a state to be active (entered) when the engine first boots up. Can
   * be called multiple times for multiple states
   */
  startState(state:State) {
    this.command({ type: 'enter-state', state });
  }

  /**
   * Builds an engine, ready to run.
   * @param skipDefaults If true, no default systems or resources will be added to the engine instance.
   * @returns an instance of the engine
   */
  async finish(skipDefaults?: boolean) {
    if (!skipDefaults) {
      // Default systems
      this.always(AnimateSprites);
      this.always(AnimateTilemaps);
      this.always(UpdateTimers);
      this.always(UpdateTweenChains);
      this.always(UpdateStateMachines);
      this.always(ShakeShakers);

      // Default commands
      this.commands.push({
        type: 'add-resource',
        resource: new AssetsResource()
      });

      const audioResource = new AudioResource();
      this.commands.push({
        type: 'add-resource',
        resource: audioResource
      });
      this.commands.push({
        type: 'add-ticker',
        ticker: audioResource
      });

      const keysResource = new KeysResource();
      this.commands.push({
        type: 'add-resource',
        resource: keysResource
      });
      this.commands.push({
        type: 'add-ticker',
        ticker: keysResource
      });
    }

    this.engine.processCommands(this.commands);

    await this.engine.rendering.init();

    return this.engine;
  }
}