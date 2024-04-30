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

export default class Update {
  delta = 0;

  constructor(public engine: Engine) { }


  next(delta: number) {
    this.delta = delta;
  }

  ecs = {
    query: <T extends NamedTypeClass[]>(...components: T): { entity: Entity, components: { [K in keyof T]: InstanceType<T[K]> } }[] => {
      return this.engine.world.query(...components);
    },
    single: <T extends NamedTypeClass[]>(...components: T): { entity: Entity, components: { [K in keyof T]: InstanceType<T[K]> } } | undefined => {
      return this.engine.world.single(...components);
    },
    get: <T extends Component>(entity: Entity, component: NamedTypeClass<T>) => {
      return this.engine.world.get(entity, component);
    }
  }

  spawn(...components: Array<Component>) {
    const future = new Future<Entity>();
    this.engine.commands.push({ type: 'spawn', components, future: future });
    return future;
  }

  despawn(entity: Entity) { this.engine.commands.push({ type: 'despawn', entity }) };

  signals = {
    send: (signal: Signal | string) => {
      if (typeof signal === 'string') {
        this.engine.commands.push({ type: 'signal', signal: { name: signal, sender: undefined } });
      } else {
        this.engine.commands.push({ type: 'signal', signal });
      }
    }
  }

  renderers = {
    add: (create: CreateRenderer) => {
      this.engine.commands.push({ type: 'add-renderer', create });
    },

    remove: (name: string) => {
      this.engine.commands.push({ type: 'remove-renderer', name });
    }
  }

  resolve = {
    entity: (entity: Entity | Future<Entity>) => {
      if (typeof entity === 'number') {
        // A direct reference
        return entity;
      } else {
        return entity.get();
      }
    },
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
    enter: (state: string) => {
      this.engine.commands.push({ type: 'enter-state', state });
    },
    exit: (state: string) => {
      this.engine.commands.push({ type: 'exit-state', state });
    }
  }

  resource<T extends Resource>(resource: NamedTypeClass<T>) { return this.engine.resources.get(resource.NAME)! as T; }
  assets() { return this.engine.resources.get(AssetsResource.NAME)! as AssetsResource; }
  audio() { return this.engine.resources.get(AudioResource.NAME)! as AudioResource; }
  keys() { return this.engine.resources.get(KeysResource.NAME)! as KeysResource; }
}