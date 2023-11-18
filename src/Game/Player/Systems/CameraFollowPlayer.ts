import Assets from "../../../Assets";
import LdtkData from "../../../Engine/Assets/Ldtk";
import Debug from "../../../Engine/Components/Debug";
import Position from "../../../Engine/Components/Position";
import Vec2 from "../../../Engine/Math/Vec2";
import AssetsResource from "../../../Engine/Resources/AssetsResource";
import ScreenResource from "../../../Engine/Resources/ScreenResource";
import Update from "../../../Engine/Update";
import { GameStateResource } from "../../Resources";
import { Player } from "../Components";

let levelId:number | null = null;
let topLeft = Vec2.ZERO;
let bottomRight = Vec2.ZERO;

export default function cameraFollowPlayer(update:Update) {
  const camera = update.getCamera();
  const gameState = update.resource<GameStateResource>(GameStateResource.NAME);
  const assets = update.resource<AssetsResource>(AssetsResource.NAME);
  const screen = update.resource<ScreenResource>(ScreenResource.NAME);

  if (levelId != gameState.level) {
    const ldtk = assets.assume<LdtkData>(Assets.PLATFORM_JSON);
    const levelName = `Level_${gameState.level}`;
    const level = ldtk.levels.find(x => x.identifier == levelName)!;

    const screenSize = screen.screenSize.scalarMultiply(0.125);
    const levelSize = new Vec2(level.pxWid, level.pxHei).scalarMultiply(0.5);

    topLeft = Vec2.ZERO.sub(levelSize).add(screenSize);
    bottomRight = Vec2.ZERO.add(levelSize).sub(screenSize);

    /*
    const cameraArea = bottomRight.sub(topLeft);
    update.spawn([
      new Debug(Vec2.ZERO, cameraArea, [0,0,1,0.5])
    ]);
    */
   
    levelId = gameState.level;
  }


  const playerQuery = update.queryCached('cameraFollowPlayer', [Player.NAME, Position.NAME]);

  for (const player of playerQuery) {
    const [ _player, pos ] = player.components as [Player, Position];
    const desiredPosition = pos.pos.max(topLeft).min(bottomRight);

    camera!.pos = desiredPosition;
  }

  /*
  const tQuery = update.queryCached('cameraFollowPlayer:debug', [Position.NAME, Debug.NAME, Player.NAME]);
  for (const t of tQuery) {
    const [pos, debug] = t.components as [Position, Debug, Player];
    debug.position = pos.pos;
  }
  */
}