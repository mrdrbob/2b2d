import Depth from "../../../2B2D/Components/Depth";
import Position from "../../../2B2D/Components/Position";
import RenderOrder from "../../../2B2D/Components/RenderOrder";
import Sprite from "../../../2B2D/Components/Sprite";
import Update from "../../../2B2D/Update";
import Curtains from "../../Curtains/Curtains";
import Depths from "../../Depths";
import GameAssets from "../../GameAssets";
import MenuCleanup from "../Components/MenuCleanup";
import MainMenuState from "../States/MainMenuState";

export default function SpawnMenu(update: Update) {
  update.spawn(
    Position.from(0, 0),
    new Depth(Depths.Hud),
    new Sprite(GameAssets.menu.handle),
    new MenuCleanup(),
  );

  update.schedule.enter(MainMenuState);
  Curtains.Open(update, 'MainMenu');
}