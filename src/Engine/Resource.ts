
export default interface Resource {
  name(): string;
}

export class ResourceBuilder {
  private resources:Map<string, Resource> = new Map<string, Resource>();

  addResource(resource:Resource) {
    this.resources.set(resource.name(), resource);
    return this;
  }

  finish() { return new Resources(this.resources); }
}

export class Resources {
  constructor(private resources:Map<string, Resource>) {}

  add(name:string, resource:Resource) {
    this.resources.set(name, resource);
  }

  get<T>(name:string) { 
    const res = this.resources.get(name);
    if (!res)
      return null;
    return res as T;
  }

  assume<T>(name:string) {
    return this.resources.get(name)! as T;
  }
}
