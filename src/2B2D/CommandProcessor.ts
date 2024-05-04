import { Command } from "./Command";
import Engine from "./Engine";
import Signal from "./Signal";

export default class CommandProcessor {
  commands = new Array<Command>();

  push(command: Command) { this.commands.push(command); }

  execute(engine: Engine) {
    for (const command of this.commands) {
      switch (command.type) {
        case 'spawn':
          const entity = engine.world.spawn(command.components);
          command.future.complete(entity);
          break;
        case 'despawn':
          engine.world.despawn(command.entity);
          break;
        case 'enter-state':
          engine.scheduler.enter(command.state);
          break;
        case 'exit-state':
          engine.scheduler.exit(command.state);
          break;
        case 'signal':
          let signalsSet = engine.dispatcher.signals.get(command.signal.name);
          if (!signalsSet) {
            signalsSet = new Array<Signal>();
            engine.dispatcher.signals.set(command.signal.name, signalsSet);
          }
          signalsSet.push(command.signal);
          break;
        case 'add-renderer':
          const renderer = command.create(engine.rendering);
          engine.rendering.renderers.push(renderer);
          break;
        case 'remove-renderer':
          const index = engine.rendering.renderers.findIndex(x => x.name == command.name);
          if (index >= 0) {
            const renderer = engine.rendering.renderers[index];
            engine.rendering.renderers.splice(index, 1);
            renderer.cleanup();
          }
          break;
        case 'add-resource':
          engine.resources.set(command.resource.name, command.resource);
          break;
        case 'add-fixed-system':
          engine.fixed.push(command.system);
          break;
      }
    }

    this.commands.length = 0;
  }
}