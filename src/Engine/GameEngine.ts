import { RenderingBuilder, RenderingSystem } from "./Rendering/Renderer";
import SpriteRenderer from "./Rendering/SpriteRenderer";
import TilemapRenderer from "./Rendering/TilemapRenderer";
import { ResourceBuilder, Resources } from "./Resource";
import AssetsResource from "./Resources/AssetsResource";
import CameraResource from "./Resources/CameraResource";
import KeysResource from "./Resources/KeysResource";
import LayersResource from "./Resources/LayersResource";
import { SystemsBuilder, SystemsRunner } from "./System";
import { updateAnimatedSprites } from "./Systems/Animated";
import Update, { Command } from "./Update";
import World from "./World";

export type UpdateData = {
  deltaTime: number, 
  world:World, 
  commands:Command[], 
  enteringStates:Set<string>, 
  exitingStates:Set<string>,
  resources:Resources,
};

export default class GameEngineBuilder {
  public readonly systems:SystemsBuilder = new SystemsBuilder();
  public readonly resources:ResourceBuilder = new ResourceBuilder();
  public readonly renderers:RenderingBuilder = new RenderingBuilder();
  public readonly layers:LayersResource = new LayersResource();

  constructor() {
    // Add some defaults
    this.resources.addResource(new KeysResource());
    this.resources.addResource(new AssetsResource());
    this.resources.addResource(new CameraResource());
    this.renderers.add(new SpriteRenderer());
    this.renderers.add(new TilemapRenderer());
    this.systems.update(SystemsRunner.ALWAYS_STATE, updateAnimatedSprites);
  }

  public async finish(width:number, height:number, zoom:number) {
    const runner = this.systems.finish();
    const resources = this.resources.finish();
    const renderingSystem = await this.renderers.finish(width, height, zoom);

    resources.add(LayersResource.NAME, this.layers);

    return new GameEngine(runner, resources, renderingSystem);
  }
}


export class GameEngine {  
  private tick:(time:number) => void;
  private world:World;
  private lastTick:number;
  private run:boolean;

  private systems:SystemsRunner;
  private resources:Resources;
  private rendering:RenderingSystem;
  private keys:KeysResource | null;
  
  private enters:Set<string> = new Set<string>();
  private exits:Set<string> = new Set<string>();

  constructor(systems:SystemsRunner, resources:Resources, rendering:RenderingSystem) {
    this.systems = systems;
    this.resources = resources;
    this.rendering = rendering;

    this.world = new World();
    this.lastTick = performance.now();
    this.run = false;

    this.keys = this.resources.get<KeysResource>(KeysResource.NAME);
    if (this.keys) {
      this.keys.bind();
    }

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

  update(delta:number) {
    const commands:Command[] = [];

    const updateData:UpdateData = {
      deltaTime: delta,
      commands: commands,
      world: this.world,
      enteringStates: this.enters,
      exitingStates: this.exits,
      resources: this.resources,
    };
    const updateContext = new Update(updateData);
    const systems = this.systems.getRunning();

    this.rendering.draw(updateContext);

    for (const system of systems) {
      system(updateContext);
    }

    this.systems.update(this.enters, this.exits);
    this.enters.clear();
    this.exits.clear();
    if (this.keys) {
      this.keys.tick();
    }

    for (const command of commands) {
      switch (command.type) {
        case 'spawn':
          const entity = this.world.newEntity();
          for (const component of command.components) {
            this.world.addComponent(entity, component);
          }
          break;
      }
    }
  }

  execute(initialStates:Iterable<string>) {
    this.systems.update(new Set<string>(initialStates), new Set<string>());
    this.start();
  }

}