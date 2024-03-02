import Resource from "../2B2D/Resource";
import Config from "./Config";

export class GameStateResouce implements Resource {
  public readonly name = GameStateResouce.name;
 
  public level:number = Config.StartLevelId;
  public health:number = Config.MaxHealth;
}
