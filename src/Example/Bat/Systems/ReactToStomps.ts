import Position from "../../../2B2D/Components/Position";
import Sprite from "../../../2B2D/Components/Sprite";
import TweenChain from "../../../2B2D/Components/TweenChain";
import UseSpriteRenderer from "../../../2B2D/Components/UseSpriteRenderer";
import Color from "../../../2B2D/Math/Color";
import Vec2 from "../../../2B2D/Math/Vec2";
import Signal from "../../../2B2D/Signal";
import Update from "../../../2B2D/Update";
import EnemyCollisionSignal from "../../Enemy/Signals/EnemyCollisionSignal";
import GameAssets from "../../GameAssets";
import Layers from "../../Layers";
import Bat from "../Components/Bat";

export default function ReactToStomps(update: Update, signals: Signal[]) {
  for (const collision of signals as EnemyCollisionSignal[]) {
    // Don't care about non-stomps. The player systems will handle that.
    if (!collision.isStomp)
      continue;

    // We only care about bats
    const bat = update.get<Bat>(collision.enemy, Bat.NAME);
    if (!bat)
      continue;

    // Get this bat's position, despawn, and spawn a ghost that floats up and does a sweet 360 flip
    const position = update.get<Position>(collision.enemy, Position.NAME)!;
    const globalPosition = update.resolvePosition(collision.enemy, position);

    update.despawn(collision.enemy);
    const startColor = new Color(1, 0, 0, 1);
    const endColor = new Color(1, 0, 0, 0);

    update.spawn([
      new Sprite(
        GameAssets.Characters.Texture.Handle,
        GameAssets.Characters.Atlas.Handle,
        Layers.Entities,
        '5',
        undefined,
        startColor
      ),
      new Position(globalPosition),
      TweenChain.build()
        .andThen(1000, step => step
          .pos(globalPosition.add(new Vec2(0, 50)))
          .color(endColor)
          .rotation(Math.PI * 2)
        )
        .chain(),
      UseSpriteRenderer
    ]);

  }
}