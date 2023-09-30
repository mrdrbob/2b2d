import { Component, ComponentName } from "./Component";
import { Entity } from "./Entity";
import { UpdateData } from "./GameEngine";

export type Command = SpawnEntityCommand;

export type SpawnEntityCommand = {
  type: 'spawn',
  components: Component[]
}

export default class Update {
  private data:UpdateData;

  constructor(data:UpdateData) {
    this.data = data;
  }

  deltaTime() { return this.data.deltaTime; }
  exitState(state:string) { this.data.exitingStates.add(state); }
  enterState(state:string) { this.data.enteringStates.add(state); }

  query(componentNames:ComponentName[]) : Array<{entity:Entity, components:Array<Component>}>  {
    return this.data.world.query(componentNames);
  }

  queryCached(name:string, componentNames:ComponentName[]) : Array<{entity:Entity, components:Array<Component>}>  {
    return this.data.world.queryCached(name, componentNames);
  }


  spawn(components:Component[]) {
    this.data.commands.push({
      type: 'spawn',
      components: components
    });
  }

  resource<T>(name:string) {
    return this.data.resources.assume<T>(name);
  }

}
