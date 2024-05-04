import Depth from "../../../2B2D/Components/Depth";
import Parent from "../../../2B2D/Components/Parent";
import Position from "../../../2B2D/Components/Position";
import Sprite from "../../../2B2D/Components/Sprite";
import Update from "../../../2B2D/Update";
import Depths from "../../Depths";
import GameAssets from "../../GameAssets";
import GameStateCleanup from "../../GameStateCleanup";
import CameraParent from "../../Init/Components/CameraParent";
import HealthDisplayComponent from "../Components/HealthDisplayComponent";

export default function SpawnHud(update: Update) {
  const camera = update.ecs.single(CameraParent)!;

  update.spawn(
    new HealthDisplayComponent(0, 1, 2),
    new Sprite(
      GameAssets.hud.handle,
    ),
    Position.from(-88, 65),
    new Parent(camera.entity),
    GameStateCleanup.Tag,
    new Depth(Depths.Hud)
  );

  update.spawn(
    new HealthDisplayComponent(2, 3, 4),
    new Sprite(
      GameAssets.hud.handle,
    ),
    Position.from(-68, 65),
    new Parent(camera.entity),
    GameStateCleanup.Tag,
    new Depth(Depths.Hud)
  );

  update.spawn(
    new HealthDisplayComponent(4, 5, 6),
    new Sprite(
      GameAssets.hud.handle,
    ),
    Position.from(-48, 65),
    new Parent(camera.entity),
    GameStateCleanup.Tag,
    new Depth(Depths.Hud)
  );
}