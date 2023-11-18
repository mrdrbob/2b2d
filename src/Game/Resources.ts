import Config from "../Config";
import Resource from "../Engine/Resource";

export class GameStateResource implements Resource {
  public static readonly NAME:string = 'GameStateResource';

  name(): string { return GameStateResource.NAME; }

  public health:number = Config.MaxHealth;
  public level:number = Config.StartLevelId;
}

