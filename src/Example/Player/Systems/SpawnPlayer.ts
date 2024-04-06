import LdtkData from "../../../2B2D/Assets/LdtkData";
import Animated from "../../../2B2D/Components/Animated";
import KineticBody from "../../../2B2D/Components/KineticBody";
import MappedInput, { Direction, PressEvent } from "../../../2B2D/Components/MappedInput";
import Position from "../../../2B2D/Components/Position";
import Sprite from "../../../2B2D/Components/Sprite";
import StateMachine from "../../../2B2D/Components/StateMachine";
import UseSpriteRenderer from "../../../2B2D/Components/UseSpriteRenderer";
import Velocity from "../../../2B2D/Components/Velocity";
import Weight from "../../../2B2D/Components/Weight";
import Vec2 from "../../../2B2D/Math/Vec2";
import Update from "../../../2B2D/Update";
import GameAssets from "../../GameAssets";
import { GameloopCleanupTag } from "../../GamePlugin";
import GameStateResouce from "../../GameStateResource";
import Layers from "../../Layers";
import Player from "../Components/Player";
import IdleState from "../Machines/IdleState";
import PlayerActions from "../PlayerActions";


export default function spawnPlayer(update: Update) {
  const gameState = update.resource<GameStateResouce>(GameStateResouce.NAME);
  const assets = update.assets();

  const ldtk = assets.assume<LdtkData>(GameAssets.LevelData.LdtkData.Handle);

  const levelName = `Level_${gameState.level}`;
  const level = ldtk.levels.find(x => x.identifier == levelName)!;
  const entities = level.layerInstances.find(x => x.__identifier == 'Entities')!;
  const player = entities.entityInstances.find(x => x.__identifier == 'Player_Spawn')!;
  const offset = new Vec2(level.pxWid, level.pxHei).scalarMultiply(-0.5);
  const position = new Vec2(player.px[0], level.pxHei - player.px[1]).add(offset);

  const inputMap = MappedInput.build(0, b => {
    b.for(PlayerActions.Jump, a => {
      a.keyboard(' ');
      a.keyboard('w');
      a.button(0);
      a.keyboard('W'); // Whoops! Capslock is on.
    });
    b.for(PlayerActions.Left, a => {
      a.keyboard('ArrowLeft');
      a.keyboard('a');
      a.negative(0, 0.25);
      a.keyboard('A');
    });
    b.for(PlayerActions.Right, a => {
      a.keyboard('ArrowRight');
      a.keyboard('d');
      a.positive(0, 0.25);
      a.keyboard('D');
    });
  });

  update.spawn([
    new Position(position),
    new Sprite(
      GameAssets.Characters.Texture.Handle,
      GameAssets.Characters.Atlas.Handle,
      Layers.Entities,
    ),
    UseSpriteRenderer,
    new Animated('Idle'),
    new Velocity(Vec2.ZERO),
    new KineticBody(new Vec2(8, 12)),
    new Weight(-0.05),
    new Player(),
    GameloopCleanupTag,
    new StateMachine(IdleState.Instance),
    inputMap,
  ]);
}