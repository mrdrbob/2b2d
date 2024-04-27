import Depth from "../../../2B2D/Components/Depth";
import Position from "../../../2B2D/Components/Position";
import RenderOrder from "../../../2B2D/Components/RenderOrder";
import Sprite from "../../../2B2D/Components/Sprite";
import SpriteTween from "../../../2B2D/Components/SpriteTween";
import Color from "../../../2B2D/Math/Color";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Depths from "../../Depths";
import GameAssets from "../../GameAssets";
import GameStateCleanup from "../../GameStateCleanup";
import Layers from "../../Layers";
import PlayerDiedSignal from "../Signals/PlayerDiedSignal";

export default function SpawnGhost(update: Update, signals: PlayerDiedSignal[]) {
  if (signals.length == 0)
    return;

  const death = signals[0];
  update.spawn(
    new Sprite(
      GameAssets.characters.handle,
      '0',
      undefined,
      Color.White(0.4)
    ),
    new Position(death.position),
    new Depth(Depths.Hud),
    new RenderOrder(Layers.curtains),
    SpriteTween.build()
      .andThen(1000, s => s
        .pos(death.position.add(new Vec2(0, 50)))
        .color(Color.White(0))
      ).chain(),
    GameStateCleanup.Tag
  );
}