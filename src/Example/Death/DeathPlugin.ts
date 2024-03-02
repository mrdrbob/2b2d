import Builder from "../../2B2D/Builder";
import Position, { PositionComponent } from "../../2B2D/Components/Position";
import Sprite from "../../2B2D/Components/Sprite";
import Timer from "../../2B2D/Components/Timer";
import UseSpriteRenderer from "../../2B2D/Components/UseSpriteRenderer";
import Update from "../../2B2D/Update";
import { CurtainsClosedSignal, CurtainsOpenedSignal, closeCurtains, openCurtains } from "../Curtains/CurtainsPlugin";
import GameAssets from "../GameAssets";
import { ExitingGameLoopSignal, GameloopCleanupTag } from "../GamePlugin";
import Layers from "../Layers";
import PlayerDied from "../Player/Signals/PlayerDiedSignal";
import States from "../States";
import Camera from '../../2B2D/Components/Camera';
import Component from "../../2B2D/Component";
import Vec2 from "../../2B2D/Math/Vec2";
import Color from "../../2B2D/Math/Color";
import Tag from "../../2B2D/Components/Tag";
import SpriteTween from "../../2B2D/Components/SpriteTween";
import { GameStateResouce } from "../GameStateResource";
import Config from "../Config";

const DeathScreenCleanupTag = "DeathScreenCleanupTag";
const CloseFinalCurtains = 'CloseFinalCurtains';
const FinalCurtainClose = 'FinalCurtainClose';

const DeathScreenState = 'DeathScreenState';

export default function DeathPlugin(builder:Builder) {
  builder.handle(PlayerDied.name, delayBeforeCurtainClose);
  builder.handleFrom(ExitingGameLoopSignal, DeathPlugin.name, exitingToDeath);
  builder.handleFrom(CurtainsClosedSignal, DeathPlugin.name, curatinsClosed);
  builder.handleFrom(CurtainsOpenedSignal, DeathPlugin.name, curtainsOpened);
  builder.handleFrom(CloseFinalCurtains, DeathPlugin.name, closeFinalCurtains);
  builder.handleFrom(CurtainsClosedSignal, FinalCurtainClose, moveBackToGameLoop);
  
  builder.cleanup(DeathScreenState, DeathScreenCleanupTag);
}

// Player has been killed. Wait a couple seconds before closing the curtains.
function delayBeforeCurtainClose(update:Update) {
  update.spawn([
    Timer(2000, { name: ExitingGameLoopSignal, sender: DeathPlugin.name })
  ])
}

// After a delay close the curtains
function exitingToDeath(update:Update) {
  closeCurtains(update, DeathPlugin.name);
}

// Curtains are closed, so spawn in BG, and oipen curtains.
function curatinsClosed(update:Update) {
  const camera = update.single([ Camera.name, Position.name ]);
  if (!camera)
    return;

  // Center the camera back on 0,0 (so we don't have to parent everything to the camera)
  const [ _cam, position ] = camera.components as [ Component, PositionComponent ];
  position.pos = Vec2.ZERO;

  // Spawn the BG
  update.spawn([
    Sprite(
      GameAssets.Death.BG.Texture.Handle,
      GameAssets.Death.BG.Atlas.Handle,
      Layers.BG
    ),
    Position.from_xy(0, 0),
    UseSpriteRenderer(),
    Tag(DeathScreenCleanupTag)
  ]);
  openCurtains(update, DeathPlugin.name);

  // Exit the game loop.
  update.exit(States.Gameloop);
  update.enter(DeathScreenState);
}

// Curtains are now opened, spawn in message and guy and tween into view.
function curtainsOpened(update:Update) {
  const start = new Vec2(0, -30);
  const end = new Vec2(0, 100);

  update.spawn([
    Sprite(
      GameAssets.Death.Guy.Texture.Handle,
      GameAssets.Death.Guy.Atlas.Handle,
      Layers.BG,
      undefined, undefined, 
      Color.White(0)
    ),
    Position(start),
    SpriteTween(start, end, Color.White(0), Color.White(0.5)),
    Timer(3000),
    UseSpriteRenderer(),
    Tag(DeathScreenCleanupTag)
  ]);

  // Spawn the message and timer separately 
  // (beacuse the timer automatically despawns itself)
  const message = update.spawn([
    Sprite(
      GameAssets.Death.Message.Texture.Handle,
      GameAssets.Death.Message.Atlas.Handle,
      Layers.FG,
      undefined, undefined,
      Color.White(0)
    ),
    Position.from_xy(0, 0),
    UseSpriteRenderer(),
    Tag(DeathScreenCleanupTag)
  ]);

  // Spawn a tween to fade / move the message
  update.spawn([
    SpriteTween(
      new Vec2(0, -10),
      new Vec2(0, 10),
      Color.White(0),
      Color.White(1),
      message
    ),
    Timer(1000)
  ]);

  // Spawn another timer to just delay closing the curtains again.
  update.spawn([
    Timer(3000, { name: CloseFinalCurtains, sender: DeathPlugin.name })
  ]);
}

// Death message has been shown, and a delay has passed, close the curtains and relaunch the game loop.
function closeFinalCurtains(update:Update) {
  closeCurtains(update, FinalCurtainClose);
}

function moveBackToGameLoop(update:Update) {
  update.exit(DeathScreenState);

  const res = update.resource<GameStateResouce>(GameStateResouce.name);

  res.health = Config.MaxHealth;
  // Let them continue where they left off, ya' big softy
  // res.level = Config.StartLevelId;

  // Entering the game-loop state should spawn everything needed.
  update.enter(States.Gameloop);
  openCurtains(update);
}
