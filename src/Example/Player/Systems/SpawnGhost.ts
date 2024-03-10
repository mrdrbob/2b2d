import Position from "../../../2B2D/Components/Position";
import Sprite from "../../../2B2D/Components/Sprite";
import TweenChain from "../../../2B2D/Components/TweenChain";
import UseSpriteRenderer from "../../../2B2D/Components/UseSpriteRenderer";
import Color from "../../../2B2D/Math/Color";
import Vec2 from "../../../2B2D/Math/Vec2";
import Signal from "../../../2B2D/Signal";
import Update from "../../../2B2D/Update";
import GameAssets from "../../GameAssets";
import { GameloopCleanupTag } from "../../GamePlugin";
import Layers from "../../Layers";
import PlayerDiedSignal from "../Signals/PlayerDiedSignal";

export default function SpawnGhost(update: Update, signals: Signal[]) {
  if (signals.length === 0)
    return;

  const death = signals[0] as PlayerDiedSignal;

  update.spawn([
    new Sprite(
      GameAssets.Characters.Texture.Handle,
      GameAssets.Characters.Atlas.Handle,
      Layers.Entities,
      '0',
      undefined,
      Color.White(0.4)
    ),
    new Position(death.position),
    TweenChain.build()
      .andThen(1000, s => s
        .pos(death.position.add(new Vec2(0, 50)))
        .color(Color.White(0))
      ).chain(),
    UseSpriteRenderer,
    GameloopCleanupTag
  ]);
}