import Resource from "../Resource";

export default class LayersResource implements Resource {
  public static readonly NAME:string = 'LayersResource';
  private layers:string[] = [];

  name(): string { return LayersResource.NAME; }

  add(name:string) {
    this.layers.push(name);
    return this.layers.length - 1;
  }

  listAll() { return this.layers; }
}
