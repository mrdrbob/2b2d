import Component from "./Components/Component";
import { Entity } from "./Entity";
import { NamedTypeClass } from "./NamedType";
import IndexCounter from "./Util/IndexCounter";

const EmptySet: ReadonlySet<Entity> = new Set<Entity>();

export class LiveWorld {
  private entities = new IndexCounter(1);
  private componentEntities = new Map<string, Set<Entity>>();
  private componentStorage = new Map<string, Component>();

  private getComponentId(entity: Entity, componentName: string) {
    return `${componentName}:${entity}`;
  }

  spawn(components: Component[]) {
    const entityId = this.entities.next() as Entity;
    for (const component of components) {
      this.add(entityId, component);
    }
    return entityId;
  }

  despawn(entity: Entity) {
    const components = this.componentEntities.keys();
    for (const component of components) {
      this.remove(entity, component);
    }
  }

  add(entity: Entity, component: Component) {
    let entities = this.componentEntities.get(component.name);
    if (!entities) {
      entities = new Set<Entity>();
      this.componentEntities.set(component.name, entities);
    }
    entities.add(entity);

    let id = this.getComponentId(entity, component.name);
    this.componentStorage.set(id, component);
  }

  remove(entity: Entity, component: string) {
    const entities = this.componentEntities.get(component);
    entities?.delete(entity);

    let id = this.getComponentId(entity, component);
    this.componentStorage.delete(id);
  }

  get<T extends Component>(entity: Entity, component: NamedTypeClass<T>) {
    let id = this.getComponentId(entity, component.NAME);
    const comp = this.componentStorage.get(id);
    if (comp)
      return comp as T;
  }

  getByName(entity: Entity, componentName: string) {
    let id = this.getComponentId(entity, componentName);
    return this.componentStorage.get(id);
  }

  set(entity: Entity, component: Component) {
    let id = this.getComponentId(entity, component.name);
    this.componentStorage.get(id);
  }

  queryEntities<T extends NamedTypeClass[]>(...components: T): ReadonlySet<Entity> {
    if (components.length === 0)
      return EmptySet;

    const first = this.componentEntities.get(components[0].NAME);
    if (!first || first.size === 0)
      return EmptySet;

    let result = new Set<Entity>(first);
    for (let x = 1; x < components.length; x++) {
      const entities = this.componentEntities.get(components[x].NAME);
      if (!entities || entities.size === 0)
        return EmptySet;

      // Poor browser support
      // result = result.intersection(entities);
      result = new Set<Entity>([...result].filter(x => entities.has(x)));
      if (result.size === 0)
        return EmptySet;
    }

    return result;
  }

  single<T extends NamedTypeClass[]>(...components: T): { entity: Entity, components: { [K in keyof T]: InstanceType<T[K]> } } | undefined {
    const results = this.query(...components);
    if (!results || results.length === 0)
      return;

    const first = results[0];
    return first;
  }

  query<T extends NamedTypeClass[]>(...components: T): { entity: Entity, components: { [K in keyof T]: InstanceType<T[K]> } }[] {
    const result = this.queryEntities(...components);

    return [...result].map(x => {
      return { entity: x, components: components.map(c => this.getByName(x, c.NAME)) }
    }) as { entity: Entity, components: { [K in keyof T]: InstanceType<T[K]> } }[];
  }
}


export default class World {
  public live = new LiveWorld();

  private queryCache = new Map<string, ReadonlySet<Entity>>();

  clearCache() {
    this.queryCache.clear();
  }

  spawn(components: Component[]) {
    this.clearCache();
    return this.live.spawn(components);
  }

  despawn(entity: Entity) {
    this.clearCache();
    this.live.despawn(entity);
  }

  add(entity: Entity, component: Component) {
    this.clearCache();
    this.live.add(entity, component);
  }

  remove(entity: Entity, component: string) {
    this.clearCache();
    this.live.remove(entity, component);
  }

  get<T extends Component>(entity: Entity, component: NamedTypeClass<T>) {
    return this.live.get(entity, component);
  }

  getByName(entity: Entity, componentName: string) {
    return this.live.getByName(entity, componentName);
  }

  set(entity: Entity, component: Component) {
    this.queryCache.clear();
    this.live.set(entity, component);
  }

  queryEntities<T extends NamedTypeClass[]>(...components: T): ReadonlySet<Entity> {
    const key = components.map(x => x.NAME).join('|');
    let cached = this.queryCache.get(key);
    if (cached)
      return cached;

    cached = this.live.queryEntities(...components);
    this.queryCache.set(key, cached);
    return cached;
  }

  single<T extends NamedTypeClass[]>(...components: T): { entity: Entity, components: { [K in keyof T]: InstanceType<T[K]> } } | undefined {
    const results = this.query(...components);
    if (!results || results.length === 0)
      return;

    const first = results[0];
    return first;
  }

  query<T extends NamedTypeClass[]>(...components: T): { entity: Entity, components: { [K in keyof T]: InstanceType<T[K]> } }[] {
    const result = this.queryEntities(...components);

    // TODO: Does this need caching too?
    return [...result].map(x => {
      return { entity: x, components: components.map(c => this.getByName(x, c.NAME)) }
    }) as { entity: Entity, components: { [K in keyof T]: InstanceType<T[K]> } }[];
  }
}
