import Builder from "../2B2D/Builder";
import ApplyAabbPhysics from "../2B2D/Systems/ApplyAabbPhysics";
import DetectCollisionTargetHits from "../2B2D/Systems/DetectCollisionTargetHits";
import Update from "../2B2D/Update";
import BatPlugin from "./Bat/BatPlugin";
import Config from "./Config";
import CurtainsPlugin from "./Curtains/CurtainsPlugin";
import DeathPlugin from "./Death/DeathPlugin";
import EnemyPlugin from "./Enemy/EnemyPlugin";
import GameStateResouce from "./GameStateResource";
import HudPlugin from "./Hud/HudPlugin";
import InitPlugin from "./Init/InitPlugin";
import Layers from "./Layers";
import LevelPlugin from "./Level/LevelPlugin";
import MainMenuPlugin, { ExitMenuSignal } from "./MainMenu/MainMenuPlugin";
import PlayerPlugin from "./Player/PlayerPlugin";
import ShakerPlugin from "./Shaker/ShakerPlugin";
import SoundPlugin from "./Sound/SoundPlugin";
import States from "./States";
import WinPlugin from "./Win/WinPlugin";

export const GameloopCleanupTag = 'GameloopCleanupTag';
export const ExitingGameLoopSignal = 'ExitingGameLoopSignal';

export default function GamePlugin(builder: Builder) {
  Layers.add(builder);

  builder.resource(new GameStateResouce());

  // Init plugin loads stuff, spawns camera, etc.
  builder.plugin(InitPlugin);

  // The black gradients are "curtains". Spawns and moves them.
  builder.plugin(CurtainsPlugin);

  // Shows the main menu, waits for input, hides the menu
  builder.plugin(MainMenuPlugin);

  // Spawns/despawns the level, runs level collisions
  builder.plugin(LevelPlugin);

  // Player movement and collisions
  builder.plugin(PlayerPlugin);

  // Display player's health
  builder.plugin(HudPlugin);

  // Systems to support enemies
  builder.plugin(EnemyPlugin);

  // Bat enemies movement, collision, death, etc
  builder.plugin(BatPlugin);

  // Spawns/despawns the "you died" screen
  builder.plugin(DeathPlugin);

  // Spawns/despawn the "you win" screen
  builder.plugin(WinPlugin);

  // Handles all SFX by responding to various signals
  builder.plugin(SoundPlugin);

  // Wiggle the camera when the player gets hit.
  builder.plugin(ShakerPlugin);

  // Global systems and events
  builder.update(States.Gameloop, ApplyAabbPhysics);
  builder.update(States.Gameloop, DetectCollisionTargetHits);
  builder.handle(ExitMenuSignal, startGameLoop);
  builder.cleanup(States.Gameloop, GameloopCleanupTag);
}

function startGameLoop(update: Update) {
  const res = update.resource<GameStateResouce>(GameStateResouce.NAME);

  res.health = Config.MaxHealth;
  res.level = Config.StartLevelId;

  update.enter(States.Gameloop);
}