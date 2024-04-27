import LdktLevelsAsset from "../../../2B2D/Assets/LdktLevelsAsset";
import Animated from "../../../2B2D/Components/Animated";
import Depth from "../../../2B2D/Components/Depth";
import KineticBody from "../../../2B2D/Components/KineticBody";
import Position from "../../../2B2D/Components/Position";
import Sprite from "../../../2B2D/Components/Sprite";
import StateMachine from "../../../2B2D/Components/StateMachine";
import Velocity from "../../../2B2D/Components/Velocity";
import Weight from "../../../2B2D/Components/Weight";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import Depths from "../../Depths";
import GameAssets from "../../GameAssets";
import GameStateCleanup from "../../GameStateCleanup";
import GameStateResource from "../../GameStateResource";
import Player from "../Components/Player";
import IdleState from "../MachineStates/IdleState";

export default function SpawnPlayer(update: Update) {
  const state = update.resource(GameStateResource);
  const assets = update.assets();

  const levelName = `Level_${state.level}`;

  const level = assets.assume<LdktLevelsAsset>(GameAssets.ldkt.handle);
  const playerEntity = level.getEntities(levelName, 'Entities').find(x => x.type == 'Player_Spawn');
  if (!playerEntity)
    return;

  update.spawn(
    new Player(),
    new Sprite(GameAssets.characters.handle),
    new Animated('Idle'),
    new Position(playerEntity.position),
    new Depth(Depths.Entities),
    new KineticBody(new Vec2(8, 12)),
    new Weight(-0.05 / ((1 / 60) * 1000)),
    new Velocity(Vec2.ZERO),
    new StateMachine(IdleState.Instance),
    GameStateCleanup.Tag
  );
}