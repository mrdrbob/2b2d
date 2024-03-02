import Position from "../../../2B2D/Components/Position";
import Sprite from "../../../2B2D/Components/Sprite";
import Color from "../../../2B2D/Math/Color";
import Signal from "../../../2B2D/Signal";
import Update from "../../../2B2D/Update";
import GameAssets from "../../GameAssets";
import Layers from "../../Layers";
import { PlayerDiedSignal } from "../Signals/PlayerDiedSignal";
import Vec2 from "../../../2B2D/Math/Vec2";
import Timer from "../../../2B2D/Components/Timer";
import UseSpriteRenderer from "../../../2B2D/Components/UseSpriteRenderer";
import { GameloopCleanupTag } from "../../GamePlugin";
import Tag from "../../../2B2D/Components/Tag";
import SpriteTween from "../../../2B2D/Components/SpriteTween";

export default function SpawnGhost(update:Update, signals:Signal[]) {
  if (signals.length === 0)
    return;

  const death = signals[0] as PlayerDiedSignal;
  
  const startColor = new Color(1, 1, 1, 0.4);
  const endColor = new Color(1, 1, 1, 0);

  update.spawn([
    Sprite(
      GameAssets.Characters.Texture.Handle,
      GameAssets.Characters.Atlas.Handle,
      Layers.Entities,
      '0',
      undefined,
      startColor
    ),
    Position(death.position),
    SpriteTween(
      death.position,
      death.position.add(new Vec2(0, 50)),
      startColor,
      endColor
    ),
    Timer(1000),
    UseSpriteRenderer(),
    Tag(GameloopCleanupTag)
  ]);
}