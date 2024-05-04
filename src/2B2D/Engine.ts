import CommandProcessor from "./CommandProcessor";
import Dispatcher from "./Dispatcher";
import RenderingSystem from "./Rendering/RenderingSystem";
import Resource from "./Resources/Resource";
import Scheduler from "./Scheduler";
import { System } from "./System";
import Update from "./Update";
import World from "./World";

export default class Engine {
  world = new World();

  scheduler = new Scheduler();

  resources = new Map<string, Resource>();

  dispatcher = new Dispatcher();

  fixed = new Array<System>();

  commands = new CommandProcessor();

  private frame = new Update(this);

  // Execution
  lastTick = 0;
  run = false;
  tick: (time: any) => void;


  constructor(public rendering: RenderingSystem) {
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

  update(delta: number) {
    // Reset frame data
    this.frame.next(delta);

    // Trigger signal handlers
    this.dispatcher.next(this.frame);

    // Execute scheduled systems
    this.scheduler.execute(this.frame);

    // Render
    this.rendering.draw(this.frame);

    // Execute all fixed systems
    for (const system of this.fixed) {
      system(this.frame);
    }

    // Process schedule changes
    this.scheduler.next();

    // Process queued commands
    this.commands.execute(this);
  }
}