import Component from "./Components/Component";
import Depth from "./Components/Depth";
import Parent from "./Components/Parent";
import Position from "./Components/Position";
import RenderOrder from "./Components/RenderOrder";
import Visible from "./Components/Visibility";
import Engine from "./Engine";
import { Entity } from "./Entity";
import Vec2 from "./Math/Vec2";
import { NamedTypeClass } from "./NamedType";
import { CreateRenderer } from "./Rendering/Renderer";
import AssetsResource from "./Resources/AssetsResource";
import AudioResource from "./Resources/AudioResource";
import KeysResource from "./Resources/KeysResource";
import Resource from "./Resources/Resource";
import Signal from "./Signal";
import Future from "./Util/Future";

/** Wraps up all the things that can be done during a frame of animation
 */
export default class Update {
  /** Returns the time difference since last frame, in ms */
  delta = 0;

  constructor(public engine: Engine) { }


  next(delta: number) {
    this.delta = delta;
  }

  ecs = {
    /** Execute a query against the ECS world and return the results as an array of 
     * entities and components. Query results will be cached. */
    query: <T extends NamedTypeClass[]>(...components: T): { entity: Entity, components: { [K in keyof T]: InstanceType<T[K]> } }[] => {
      return this.engine.world.query(...components);
    },

    /** Executes a query for a signle entity. If at least one entity matches, the
     * first is returned, otherwise undefined.
     */
    single: <T extends NamedTypeClass[]>(...components: T): { entity: Entity, components: { [K in keyof T]: InstanceType<T[K]> } } | undefined => {
      return this.engine.world.single(...components);
    },

    /** Returns an individual component of an entity if it exists, `undefined` otherwise. */
    get: <T extends Component>(entity: Entity, component: NamedTypeClass<T>) => {
      return this.engine.world.get(entity, component);
    }
  }

  /** Spawns an entity by sending a `spawn` command, and returns a resolvable entity reference 
   * that can be resolved next frame.
   */
  spawn(...components: Array<Component>) {
    const future = new Future<Entity>();
    this.engine.commands.push({ type: 'spawn', components, future: future });
    return future;
  }

  /** Despawns an entity by sending a `despawn` command. */
  despawn(entity: Entity) { this.engine.commands.push({ type: 'despawn', entity }) };

  signals = {
    /** Sends a signal. If `signal` is a string, a default signal type with no sender is sent */
    send: (signal: Signal | string) => {
      if (typeof signal === 'string') {
        this.engine.commands.push({ type: 'signal', signal: { name: signal, sender: undefined } });
      } else {
        this.engine.commands.push({ type: 'signal', signal });
      }
    }
  }

  renderers = {
    /** Registers a new Renderer system via a `add-renderer` command.  */
    add: (create: CreateRenderer) => {
      this.engine.commands.push({ type: 'add-renderer', create });
    },

    /** Removes a  Renderer system via a `remove-renderer` command.  */
    remove: (name: string) => {
      this.engine.commands.push({ type: 'remove-renderer', name });
    }
  }

  resolve = {
    /** Resolves a resolvable entity reference to an entity ID if the entity exists.
     * Spawning returns a resolvable reference that can be resovled to the entity ID in the 
     * next frame. This is because spawning is done via command which is executed at the end 
     * of the frame. Will return `undefined` if no entity could be resolved.
     */
    entity: (entity: Entity | Future<Entity>) => {
      if (typeof entity === 'number') {
        // A direct reference
        return entity;
      } else {
        return entity.get();
      }
    },

    /** Will recursively resolve a chain of `Parent` components to work out the final 
     * global position of an entity with a `Position` component.
     */
    position: (entity: Entity, position: Position): Vec2 => {
      const parent = this.ecs.get(entity, Parent);
      if (!parent)
        return position.position;

      let parentEntity = this.resolve.entity(parent.entity);
      if (!parentEntity) {
        console.warn(`Attempt to resovle an unresolvable entity reference. Child: ${entity}. Parent: ${parentEntity}`);
        return position.position;
      }

      const parentPosition = this.ecs.get(parentEntity, Position);
      if (parentPosition) {
        return position.position.add(
          this.resolve.position(parentEntity, parentPosition)
        );
      }
      return position.position;
    },

    /** Will recursively resolve a chain of `Parent` components to work out the final 
     * visibility state of an entity. If no `Visibility` component is found, the entity 
     * defaults to visible
     */
    visibility: (entity: Entity): boolean => {
      const visibleComponent = this.ecs.get(entity, Visible);
      if (visibleComponent)
        return visibleComponent.visible;

      const parent = this.ecs.get(entity, Parent);
      if (!parent)
        return true;

      let parentEntity = this.resolve.entity(parent.entity);
      if (!parentEntity)
        return true;

      return this.resolve.visibility(parentEntity);
    },

    /** Will recursively resolve a chain of `Parent` components to work out the final 
     * render order of an entity. If no `RenderOrder` components are found, entity will 
     * be drawn in the first batch.
     */
    renderOrder: (entity: Entity): string | undefined => {
      const component = this.ecs.get(entity, RenderOrder);
      if (component)
        return component.layer;

      const parent = this.ecs.get(entity, Parent);
      if (!parent)
        return undefined;

      let parentEntity = this.resolve.entity(parent.entity);
      if (!parentEntity)
        return undefined;

      return this.resolve.renderOrder(parentEntity);
    },

    /** Will recursively resolve a chain of `Parent` components to work out the final 
     * depth of an entity. If no `Depth` components are found, entity will 
     * be assumed to have a depth of 0.5.
     */
    depth: (entity: Entity): number => {
      const component = this.ecs.get(entity, Depth);
      if (component)
        return component.depth;

      const parent = this.ecs.get(entity, Parent);
      if (!parent)
        return this.engine.rendering.defaultDepth;

      let parentEntity = this.resolve.entity(parent.entity);
      if (!parentEntity)
        return this.engine.rendering.defaultDepth;

      return this.resolve.depth(parentEntity);
    }
  }

  schedule = {
    /** Enters the `state` by sending an `enter-state` command. */
    enter: (state: string) => {
      this.engine.commands.push({ type: 'enter-state', state });
    },

    /** Exits the `state` by sending an `exit-state` command. */
    exit: (state: string) => {
      this.engine.commands.push({ type: 'exit-state', state });
    }
  }

  /** Gets a resource and assumes it exists and is of the correct type. */
  resource<T extends Resource>(resource: NamedTypeClass<T>) { return this.engine.resources.get(resource.NAME)! as T; }


  /** Convenience method to get the `AssetsResource` instance (for loading and accessing
   * assets). Assumes it exists and is registered. */
  assets() { return this.engine.resources.get(AssetsResource.NAME)! as AssetsResource; }

  /** Convenience method to get the `AudioResource` instance (for loading and playing
   * audio). Assumes it exists and is registered. */
  audio() { return this.engine.resources.get(AudioResource.NAME)! as AudioResource; }

  /** Convenience method to get the `KeysResource` instance (for getting and responding 
   * to keyboard inputes). Assumes it exists and is registered. */
  keys() { return this.engine.resources.get(KeysResource.NAME)! as KeysResource; }
}