import { Command } from "./Command";
import Resource from "./Resource";
import World from "./World";
import Signal from "./Signal";
import { State } from "./State";
import Component from "./Component";
import { Entity, ResolvableEntity } from "./Entity";
import Renderer from "./Rendering/Renderer";
import RenderingSystem, { CreateRenderer } from "./Rendering/RenderingSystem";
import { Layer } from "./Layer";
import Position, { PositionComponent } from "./Components/Position";
import Parent, { ParentComponent } from "./Components/Parent";
import Vec2 from "./Math/Vec2";
import Assets, { AssetsResource } from "./Resources/AssetsResource";
import Visible, { VisibleComponent } from "./Components/Visible";
import Keys, { KeysResource } from "./Resources/KeysResource";

export type UpdateData = {
  world: World,
  commands: Array<Command>,
  resources: Map<string, Resource>,
  signals: Map<string, Signal[]>,
  delta: number,
  renderers: Map<string, Renderer>,
  rendering: RenderingSystem,
  layers: Array<Layer>
};

export default class Update {
  constructor(public data:UpdateData) { }

  /** Returns the time difference since last frame, in ms */
  delta() { return this.data.delta; }

  /** Execute a query against the ECS world and return the results as an array of 
   * entities and components. Query results will be cached. */
  query(components: string[]) { return this.data.world.query(components); }

  /** Executes a query for a signle entity. If at least one entity matches, the
   * first is returned, otherwise undefined.
   */
  single(components: string[]) {
    const query = this.query(components);
    if (query.length === 0)
      return undefined;
    return query[0];
  }

  /** Query the ECS world bypassing the cache. */
  queryLive(components: string[]) { return this.data.world.queryLive(components); }

  /** Returns an individual component of an entity if it exists, `undefined` otherwise. */
  get<T>(entity:Entity, component:string) { 
    const instance = this.data.world.get(entity, component);
    if (!instance)
      return;
    return instance as T;
  }

  /** Gets a resource and assumes it exists and is of the correct type. */
  resource<T extends Resource>(name:string): T {
    return this.data.resources.get(name)! as T;
  }

  /** Convenience method to get the `AssetsResource` instance (for loading and accessing
   * assets). Assumes it exists and is registered. */
  assets() { return this.resource<AssetsResource>(Assets.name); }

  /** Convenience method to get the `KeysResource` instance (for getting and responding 
   * to keyboard inputes). Assumes it exists and is registered. */
  keys() { return this.resource<KeysResource>(Keys.name); }

  /** Exits the `state` by sending an `exit-state` command. */
  exit(state:State) { this.data.commands.push({ type: 'exit-state', state }) };

  /** Enters the `state` by sending an `enter-state` command. */
  enter(state:State) { this.data.commands.push({ type: 'enter-state', state }) };

  /** Spawns an entity by sending a `spawn` command, and returns a resolvable entity reference 
   * that can be resolved next frame.
   */
  spawn(components:Component[]) { 
    const resolvable = new ResolvableEntity();
    this.data.commands.push({ type: 'spawn', components, resolvable });
    return resolvable;
  };

  /** Despawns an entity by sending a `despawn` command. */
  despawn(entity:Entity) { this.data.commands.push({ type: 'despawn', entity }) };

  signals = {
    /** Sends a signal. If `signal` is a string, a default signal type with no sender is sent */
    send: (signal:Signal | string) => {
      if (typeof signal === 'string') {
        this.data.commands.push({ type: 'signal', signal: { name: signal, sender: undefined } }) 
      } else {
        this.data.commands.push({ type: 'signal', signal }) 
      }
    },

    /** Returns true if a Signal of type `signal` is in the queue for this frame. */
    has: (name:string) => {
      return this.data.signals.has(name);
    },

    /** Returns any signals matching `signal` type that are queued for this frame. */
    get: (name:string) => {
      return this.data.signals.get(name);
    }
  }

  /** Registers a new Renderer system via a `add-renderer` command.  */
  addRenderer(create: CreateRenderer) { this.data.commands.push({ type: 'add-renderer', create  }) };

  /** Removes a  Renderer system via a `remove-renderer` command.  */
  removeRenderer(name: string) { this.data.commands.push({ type: 'remove-renderer', name }) };

  /** Resolves a resolvable entity reference to an entity ID if the entity exists.
   * Spawning returns a resolvable reference that can be resovled to the entity ID in the 
   * next frame. This is because spawning is done via command which is executed at the end 
   * of the frame. Will return `undefined` if no entity could be resolved.
   */
  resolveEntity(entity: Entity | ResolvableEntity) {
    if (typeof entity === 'number') {
      // A direct reference
      return entity;
    } else {
      if (!entity.isResolved()) {
        return undefined;
      }

      return entity.entity;
    }
  }

  /** Will recursively resolve a chain of `Parent` components to work out the final 
   * global position of an entity with a `Position` component.
   */
  resolvePosition(entity:Entity, pos:PositionComponent) : Vec2 {
    const parent = this.get<ParentComponent>(entity, Parent.name);
    if (!parent)
      return pos.pos;

    let parentEntity = this.resolveEntity(parent.entity);
    if (!parentEntity) {
      console.warn(`Attempt to resovle an unresolvable entity reference. Child: ${entity}`);
      return pos.pos;
    }

    const parentPosition = this.get<PositionComponent>(parentEntity, Position.name);
    if (parentPosition) {
      return pos.pos.add(
        this.resolvePosition(parentEntity, parentPosition)
      );
    }
    return pos.pos;
  }

  /** Will recursively resolve a chain of `Parent` components to work out the final 
   * visibility of an entity with a `Visible` component. *If ehe entity and no parents
   * have a Visible component, the entity is assumed to be visible.* To hide a component,
   * you need a `Visible` component set to `false`.
   */
  resolveVisibility(entity:Entity): boolean {
    const visibleComponent = this.get<VisibleComponent>(entity, Visible.name);
    if (visibleComponent)
      return visibleComponent.visible;

    const parent = this.get<ParentComponent>(entity, Parent.name);
    if (!parent)
      return true;
    
    let parentEntity = this.resolveEntity(parent.entity);
    if (!parentEntity)
      return true;
    
    return this.resolveVisibility(parentEntity);
  }

  /** Will despawn any entities with the `tag` component. */
  cleanUpTag(tag:string) {
    const query = this.query([ tag ]);
    for (const entity of query) {
      this.despawn(entity.entity);
    }
  }
}