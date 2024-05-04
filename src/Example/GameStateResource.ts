import Resource from "../2B2D/Resources/Resource";
import Config from "./Config";

export default class GameStateResource implements Resource {
  static readonly NAME: string = 'GameStateResource';
  readonly name: string = GameStateResource.NAME;

  public level: number = Config.StartLevelId;
  public health: number = Config.MaxHealth;
}