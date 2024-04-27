import Sprite from "../../../2B2D/Components/Sprite";
import Update from "../../../2B2D/Update";
import GameStateResource from "../../GameStateResource";
import HealthDisplayComponent from "../Components/HealthDisplayComponent";

export default function UpdateHud(update: Update) {
  const query = update.ecs.query(HealthDisplayComponent, Sprite);
  const gameState = update.resource(GameStateResource);
  const health = gameState.health;

  for (const entity of query) {
    const [display, sprite] = entity.components;

    sprite.frame = health <= display.empty ? '2'
      : health == display.half ? '1'
        : '0';
  }
}