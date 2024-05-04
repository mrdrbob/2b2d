import LdktLevelsAsset from "../../../2B2D/Assets/LdktLevelsAsset";
import Animated from "../../../2B2D/Components/Animated";
import CollisionTarget from "../../../2B2D/Components/CollisionTarget";
import Depth from "../../../2B2D/Components/Depth";
import Position from "../../../2B2D/Components/Position";
import Sprite from "../../../2B2D/Components/Sprite";
import SpriteTween from "../../../2B2D/Components/SpriteTween";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Depths from "../../Depths";
import Enemy from "../../Enemy/Components/Enemy";
import GameAssets from "../../GameAssets";
import GameStateCleanup from "../../GameStateCleanup";
import GameStateResource from "../../GameStateResource";
import BatCollisionTarget from "../BatCollisionTarget";

export default function SpawnBats(update: Update) {
  const assets = update.assets();
  const ldtk = assets.assume<LdktLevelsAsset>(GameAssets.ldkt.handle);
  const gameState = update.resource(GameStateResource);

  const levelId = `Level_${gameState.level}`;

  const bats = ldtk.getEntities(levelId, 'Entities').filter(x => x.type == 'Enemy_Spawn');
  const levelOffset = ldtk.getLevelOffset(levelId);

  let gridSize = ldtk.data.defs.layers.find(x => x.identifier == 'Entities')!.gridSize;

  for (const bat of bats) {
    const targetsInstance = bat.fieldInstances.find(x => x.__identifier == 'Target');
    const speedInstance = bat.fieldInstances.find(x => x.__identifier == 'Speed');

    const speed = (speedInstance ? speedInstance.__value as number : 20) || 20;

    const startPosition = bat.position;
    const halfGrid = new Vec2(gridSize, -gridSize).scalarMultiply(0.5);

    const builder = SpriteTween.build();
    if (targetsInstance) {
      const points = targetsInstance.__value as Array<{ cx: number, cy: number }>;

      let pos = startPosition;
      for (const point of points) {
        const nextPos = new Vec2(point.cx * gridSize, levelOffset.invert(point.cy * gridSize)).add(levelOffset.offset).add(halfGrid);

        const travelX = Math.abs(nextPos.x - pos.x);
        const travelY = Math.abs(nextPos.y - pos.y);
        const travel = Math.max(travelX, travelY);
        const time = travel * speed;


        builder.andThen(500); // Do nothing for half a second
        builder.andThen(time, s => s.pos(nextPos));

        pos = nextPos;
      }

      const travelX = Math.abs(startPosition.x - pos.x);
      const travelY = Math.abs(startPosition.y - pos.y);
      const travel = Math.max(travelX, travelY);
      const time = travel * speed;
      builder.andThen(500);
      builder.andThen(time, s => s.pos(startPosition));
    }

    update.spawn(
      new Position(startPosition),
      new Sprite(GameAssets.characters.handle),
      new Depth(Depths.Entities),
      new Animated('FlyEnemy'),
      builder.loop(true).chain(),
      new CollisionTarget(BatCollisionTarget, new Vec2(8, 6)),
      new Enemy(1),
      GameStateCleanup.Tag
    );
    // const points = bat.fieldInstances.__value as Array<{ cx: number, cy: number}>;
  }
}