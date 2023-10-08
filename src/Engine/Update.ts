import Component from "./Component";
import Camera from "./Components/Camera";
import Position from "./Components/Position";
import { Entity } from "./Entity";
import { UpdateData } from "./GameEngine";

export type Command = SpawnEntityCommand | DespawnEntityCommand;

export type SpawnEntityCommand = {
  type: 'spawn',
  components: Component[]
}

export type DespawnEntityCommand = {
  type: 'despawn',
  entity: number;
}

export default class Update {
  private data: UpdateData;

  constructor(data: UpdateData) {
    this.data = data;
  }

  deltaTime() { return this.data.deltaTime; }
  exitState(state: string) { this.data.exitingStates.add(state); }
  enterState(state: string) { this.data.enteringStates.add(state); }

  query(componentNames: string[]): Array<{ entity: Entity, components: Array<Component> }> {
    return this.data.world.query(componentNames);
  }

  queryCached(name: string, componentNames: string[]): Array<{ entity: Entity, components: Array<Component> }> {
    return this.data.world.queryCached(name, componentNames);
  }

  getEntityComponents(entity:Entity, components:string[]) { return this.data.world.getEntityComponents(entity, components); }

  getCamera() {
    const query = this.data.world.queryCached('globalCameraQuery', [Camera.NAME, Position.NAME]);
    if (query.length == 0)
      return undefined;
    const entity = query[0];
    const [_camera, position] = entity.components as [Camera, Position];
    return position;
  }

  spawn(components: Component[]) {
    this.data.commands.push({
      type: 'spawn',
      components: components
    });
  }

  despawn(entity: number) {
    this.data.commands.push({
      type: 'despawn',
      entity: entity
    });
  }

  resource<T>(name: string) {
    return this.data.resources.assume<T>(name);
  }

  event<T>(name:string) { return this.data.events.assume<T>(name); }
  getEvent<T>(name:string) { return this.data.events.get<T>(name); }

}
