import Component from "./Component";
import { Entity } from "./Entity";

export interface QueryResult {
  entity:Entity, 
  components:Array<Component>
}

export default class World {
  private nextEntityId:number;
  private entities:Map<Entity, Map<string, Component>>;
  private componentToEntitiesMap:Map<string, Set<Entity>>;
  private queryCache:Map<string, Array<QueryResult>>;

  constructor() {
    this.nextEntityId = 1;
    this.entities = new Map<Entity, Map<string, Component>>();
    this.componentToEntitiesMap = new Map<string, Set<Entity>>();
    this.queryCache = new Map<string, Array<{entity:Entity, components:Array<Component>}>>();
  }

  spawn() {
    const id = this.nextEntityId++;
    this.entities.set(id, new Map<string, Component>());
    return id;
  }

  add(entity:Entity, component:Component) {
    const entityComponents = this.entities.get(entity);
    if (!entityComponents)
      return; // TODO: Error?

    entityComponents.set(component.name, component);
    this.queryCache.clear();

    let entitiesWithThisComponent = this.componentToEntitiesMap.get(component.name);
    if (!entitiesWithThisComponent) {
      entitiesWithThisComponent = new Set<Entity>();
      this.componentToEntitiesMap.set(component.name, entitiesWithThisComponent);
    }
    entitiesWithThisComponent.add(entity);
  }

  remove(entity:Entity, compontentName:string) {
    const entityComponents = this.entities.get(entity);
    if (!entityComponents)
      return; // TODO: Error?

    entityComponents.delete(compontentName);
    this.queryCache.clear();

    let entitiesWithThisComponent = this.componentToEntitiesMap.get(compontentName);
    if (!entitiesWithThisComponent)
      return;
    entitiesWithThisComponent.delete(entity);
  }

  get(entity:Entity, component:string) {
    const components = this.entities.get(entity);
    if (!components || components.size === 0)
      return;

    return components.get(component);
  }

  despawn(entity:Entity) {
    const entityComponents = this.entities.get(entity)!;
    if (entityComponents === undefined)
      return;
    
    for (const componentName of entityComponents.keys()) {
      const set = this.componentToEntitiesMap.get(componentName);
      if (set) {
        set.delete(entity);
      }
    }

    this.entities.delete(entity);

    this.queryCache.clear();
  }

  query(componentNames:Array<string>) :Array<QueryResult> {
    const cachedName = componentNames.join('|');
    const cached = this.queryCache.get(cachedName);
    if (cached)
      return cached;

    const liveResults = this.queryLive(componentNames);
    this.queryCache.set(cachedName, liveResults);
    return liveResults;
  }

  queryLive(componentNames:Array<string>) : Array<QueryResult> {
    // If no components are being queried, 
    if (componentNames.length === 0)
      return [];

    // Grab the first component and start the list from this component, rather than
    // starting with all possible entities. If nothing matches, bail early.
    const firstComponent = this.componentToEntitiesMap.get(componentNames[0]);
    if (!firstComponent || firstComponent.size == 0)
      return [];

    // Start a running list and begin winnowing it down by going through remaining components.
    let returnedEntities = new Set<Entity>(firstComponent);
    for (const component of componentNames.slice(1)) {
      const entities = this.componentToEntitiesMap.get(component);
      if (!entities || entities.size == 0)
        return [];

        // Reduce the set. Bail early if no matches.
        returnedEntities = new Set<Entity>( [...returnedEntities].filter(x => entities.has(x)) );
        if (returnedEntities.size == 0)
          return [];

    }

    // At least some entities matched, so put together entities and components and return:
    return [...returnedEntities].map(entity => {
      let components = this.entities.get(entity)!;
      return {
        entity,
        components: componentNames.map(x => components.get(x)!)
      };
    });
  }
}