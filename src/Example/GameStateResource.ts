import Resource from "../2B2D/Resource";
import Config from "./Config";

export default class GameStateResouce implements Resource {
  static readonly NAME: string = 'GameStateResource';
  readonly name = GameStateResouce.NAME;

  public level: number = Config.StartLevelId;
  public health: number = Config.MaxHealth;
}
