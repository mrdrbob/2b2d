import Depth from "../../../2B2D/Components/Depth";
import Position from "../../../2B2D/Components/Position";
import RenderOrder from "../../../2B2D/Components/RenderOrder";
import Sprite from "../../../2B2D/Components/Sprite";
import SpriteTween from "../../../2B2D/Components/SpriteTween";
import Color from "../../../2B2D/Math/Color";
import Vec2 from "../../../2B2D/Math/Vec2";
import CollisionTargetHitSignal from "../../../2B2D/Signals/CollisionTargetHitSignal";
import Update from "../../../2B2D/Update";
import Depths from "../../Depths";
import Enemy from "../../Enemy/Components/Enemy";
import GameAssets from "../../GameAssets";
import Layers from "../../Layers";
import PlayerCollisionSignal from "../../Player/Signals/PlayerCollisionSignal";
import BatCollisionTarget from "../BatCollisionTarget";
import BatStompedSignal from "../Signals/BatStompedSignal";

export default function HandlePlayerCollision(update: Update, signals: CollisionTargetHitSignal[]) {
  for (const hit of signals) {
    if (hit.sender != BatCollisionTarget)
      continue;

    const bottomOfPlayer = hit.kineticBody.position.y - hit.kineticBody.size.y;
    const yDiff = (bottomOfPlayer - hit.target.position.y) / hit.target.size.y;
    const isStomp = yDiff > 0.25;

    if (!isStomp) {
      const enemy = update.ecs.get(hit.target.entity, Enemy);
      if (!enemy)
        continue;

      update.signals.send(new PlayerCollisionSignal('Bat', enemy.damage, hit.kineticBody.entity));
      continue;
    }

    update.despawn(hit.target.entity);
    update.spawn(
      new Position(hit.target.position),
      new Depth(Depths.Entities),
      new RenderOrder(Layers.over),
      new Sprite(GameAssets.characters.handle, '7', Vec2.ONE, new Color(1, 0, 0, 1)),
      SpriteTween.build()
        .andThen(1000, x => x
          .pos(hit.target.position.add(new Vec2(0, 50)))
          .rotation(2 * Math.PI)
          .color(new Color(1, 0, 0, 0))
        )
        .chain()
    );

    update.signals.send(BatStompedSignal);
  }
}