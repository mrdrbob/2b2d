import Component from "./Component";
import { Entity } from "./Entity";

export default class World {
  private entityId:number;
  private entities:Map<Entity, Component[]>;
  private entityQueryCache:Map<string, Set<Entity>>;
  private queryCache:Map<string, Array<{entity:Entity, components:Array<Component>}>> = new Map<string, Array<{entity:Entity, components:Array<Component>}>>();

  constructor () {
    this.entityId = 0;
    this.entities = new Map<Entity, Component[]>();
    this.entityQueryCache = new Map<string, Set<Entity>>();
  }

  newEntity():Entity {
    const id = this.entityId;
    this.entities.set(id, []);
    this.entityId += 1;
    return id;
  }

  addComponent(entity:Entity, component:Component) {
    const entityComponents = this.entities.get(entity);
    entityComponents?.push(component);
    this.queryCache.clear();

    const name = component.name();
    let cache = this.entityQueryCache.get(name);
    if (!cache) {
      cache = new Set<Entity>();
      this.entityQueryCache.set(name, cache);
    }
    cache.add(entity);
  }

  removeComponent(entity:Entity, componentName:string) {
    const entityComponents = this.entities.get(entity)!;
    const componentIndex = entityComponents.findIndex((v) => v.name() == componentName);
    if (componentIndex < 0)
      return;
    entityComponents.splice(componentIndex, 1);
    this.queryCache.clear();

    let cache = this.entityQueryCache.get(componentName);
    if (!cache)
      return;
    cache.delete(entity);
  }

  removeEntity(entity:Entity) {
    const entityComponents = this.entities.get(entity)!;
    for (const component of entityComponents) {
      const set = this.entityQueryCache.get(component.name());
      if (set)
        set.delete(entity);
    }

    this.entities.delete(entity);

    this.queryCache.clear();
  }
  
  queryCached(uniqueName:string, componentNames:string[]) : Array<{entity:Entity, components:Array<Component>}> {
    const cached = this.queryCache.get(uniqueName);
    if (cached) {
      return cached;
    }

    const live = this.query(componentNames);
    this.queryCache.set(uniqueName, live);
    return live;
  }

  getEntityComponents(entity:Entity, componentNames:string[]) {
    const components = this.entities.get(entity)!;
    return componentNames.map(x => components.find(c => c.name() == x)!);
  }

  query(componentNames:string[]) : Array<{entity:Entity, components:Array<Component>}> {
    // TODO: Memoize this?
    let entities = new Set<Entity>(this.entities.keys());

    for (const name of componentNames) {
      let cache = this.entityQueryCache.get(name);
      if (!cache || cache.size == 0)
        return [];
      // NO build-in intersection support.
      entities = new Set<Entity>( [...entities].filter(x => cache?.has(x)) );
    }

    return [...entities].map(entity => {
      let components = this.entities.get(entity)!;
      return {
        entity,
        components: componentNames.map(x => components.find(c => c.name() == x)!)
      };
    });
  }
}