import Resource from "../Engine/Resource";

export class GameStateResource implements Resource {
  public static readonly NAME:string = 'GameStateResource';

  name(): string { return GameStateResource.NAME }

  public health:number = 100;
  public level:number = 0;
}

