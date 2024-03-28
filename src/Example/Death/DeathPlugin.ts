import Builder from "../../2B2D/Builder";
import Component from "../../2B2D/Component";
import Position from "../../2B2D/Components/Position";
import Sprite from "../../2B2D/Components/Sprite";
import Timer from "../../2B2D/Components/Timer";
import TweenChain from "../../2B2D/Components/TweenChain";
import UseSpriteRenderer from "../../2B2D/Components/UseSpriteRenderer";
import Color from "../../2B2D/Math/Color";
import Vec2 from "../../2B2D/Math/Vec2";
import Update from "../../2B2D/Update";
import Config from "../Config";
import { CurtainsClosedSignal, CurtainsOpenedSignal, closeCurtains, openCurtains } from "../Curtains/CurtainsPlugin";
import GameAssets from "../GameAssets";
import { ExitingGameLoopSignal } from "../GamePlugin";
import GameStateResouce from "../GameStateResource";
import { CameraParent } from "../Init/InitPlugin";
import Layers from "../Layers";
import PlayerDied from "../Player/Signals/PlayerDiedSignal";
import States from "../States";

const DeathScreenCleanupTag = "DeathScreenCleanupTag";
const CloseFinalCurtains = 'CloseFinalCurtains';
const FinalCurtainClose = 'FinalCurtainClose';

const DeathScreenState = 'DeathScreenState';

const DeathPluginName = 'DeathPluginName';

export default function DeathPlugin(builder: Builder) {
  builder.handle(PlayerDied.NAME, delayBeforeCurtainClose);
  builder.handleFrom(ExitingGameLoopSignal, DeathPluginName, exitingToDeath);
  builder.handleFrom(CurtainsClosedSignal, DeathPluginName, curatinsClosed);
  builder.handleFrom(CurtainsOpenedSignal, DeathPluginName, curtainsOpened);
  builder.handleFrom(CloseFinalCurtains, DeathPluginName, closeFinalCurtains);
  builder.handleFrom(CurtainsClosedSignal, FinalCurtainClose, moveBackToGameLoop);

  builder.cleanup(DeathScreenState, DeathScreenCleanupTag);
}

// Player has been killed. Wait a couple seconds before closing the curtains.
function delayBeforeCurtainClose(update: Update) {
  update.spawn([
    new Timer(2000, { name: ExitingGameLoopSignal, sender: DeathPluginName })
  ]);
}

// After a delay close the curtains
function exitingToDeath(update: Update) {
  closeCurtains(update, DeathPluginName);
}

// Curtains are closed, so spawn in BG, and oipen curtains.
function curatinsClosed(update: Update) {
  const camera = update.single([CameraParent, Position.NAME]);
  if (!camera)
    return;

  // Center the camera back on 0,0 (so we don't have to parent everything to the camera)
  const [_cam, position] = camera.components as [Component, Position];
  position.pos = Vec2.ZERO;

  // Spawn the BG
  update.spawn([
    new Sprite(
      GameAssets.Death.BG.Texture.Handle,
      GameAssets.Death.BG.Atlas.Handle,
      Layers.BG
    ),
    Position.fromXY(0, 0),
    UseSpriteRenderer,
    DeathScreenCleanupTag
  ]);
  openCurtains(update, DeathPluginName);

  // Exit the game loop.
  update.exit(States.Gameloop);
  update.enter(DeathScreenState);
}

// Curtains are now opened, spawn in message and guy and tween into view.
function curtainsOpened(update: Update) {
  update.spawn([
    new Sprite(
      GameAssets.Death.Guy.Texture.Handle,
      GameAssets.Death.Guy.Atlas.Handle,
      Layers.BG,
      undefined,
      undefined,
      Color.White(0)
    ),
    Position.fromXY(0, -30),
    TweenChain.build()
      .andThen(3000, s => s.pos(new Vec2(0, 100)).color(Color.White(0.5)))
      .chain(),
    UseSpriteRenderer,
    DeathScreenCleanupTag
  ]);

  // Spawn the message and tween chain separately 
  // (beacuse the tween chain automatically despawns itself)
  const message = update.spawn([
    new Sprite(
      GameAssets.Death.Message.Texture.Handle,
      GameAssets.Death.Message.Atlas.Handle,
      Layers.FG,
      undefined,
      new Vec2(0.8, 0.8),
      Color.White(0)
    ),
    Position.fromXY(0, 0),
    UseSpriteRenderer,
    DeathScreenCleanupTag
  ]);

  // Put together a little chained animation.
  // Start at zero alpha, position 0,0.
  // Move to 0, 10 and fade in for 1 second.
  // Hold for 2 seconds.
  // Move to 0, 30 and fade out for 1 second.
  const animation = TweenChain.build()
    .andThen(1000, (step) => step
      .pos(new Vec2(0, 10))
      .color(Color.White(1))
      .scale(Vec2.ONE)
    )
    .andThen(2000)
    .andThen(1000, (step) => step
      .pos(new Vec2(0, 30))
      .color(Color.White(0))
    )
    .chain(message);

  update.spawn([animation]);

  // Spawn another timer to just delay closing the curtains again.
  update.spawn([
    new Timer(5000, { name: CloseFinalCurtains, sender: DeathPluginName })
  ]);
}

// Death message has been shown, and a delay has passed, close the curtains and relaunch the game loop.
function closeFinalCurtains(update: Update) {
  closeCurtains(update, FinalCurtainClose);
}

function moveBackToGameLoop(update: Update) {
  update.exit(DeathScreenState);

  const res = update.resource<GameStateResouce>(GameStateResouce.NAME);

  res.health = Config.MaxHealth;
  // Let them continue where they left off, ya' big softy
  // res.level = Config.StartLevelId;

  // Entering the game-loop state should spawn everything needed.
  update.enter(States.Gameloop);
  openCurtains(update);
}
