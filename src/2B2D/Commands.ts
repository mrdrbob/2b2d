/*
import { Command } from "./Command";
import Component from "./Component";
import { Entity, ResolvableEntity } from "./Entity";

export default {
  spawn(components: Component[]) : Command { 
    const resolvable = new ResolvableEntity();
    return { type: 'spawn', components: components, resolvable }; 
  },
  despawn(entity: Entity) : Command { return { type: 'despawn', entity: entity }; },
  enter(state: string) : Command { return { type: 'enter-state', state: state }; },
  exit(state: string) : Command { return { type: 'exit-state', state: state }; },
};
*/
