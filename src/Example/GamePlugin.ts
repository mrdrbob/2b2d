import Builder from "../2B2D/Builder";
import ApplyAaabbPhysics from "../2B2D/Systems/ApplyAabbPhysics";
import DetectCollisionTargetHits from "../2B2D/Systems/DetectCollisionTargetHits";
import Update from "../2B2D/Update";
import BatPlugin from "./Bat/BatPlugin";
import Config from "./Config";
import Curtains from "./Curtains/Curtains";
import CurtainsPlugin from "./Curtains/CurtainsPlugin";
import DeathPlugin from "./Death/DeathPlugin";
import DeathScreenExitSignal from "./Death/Signals/DeathScreenExitSignal";
import EnemyPlugin from "./Enemy/EnemyPlugin";
import GameStateCleanup from "./GameStateCleanup";
import GameStateResource from "./GameStateResource";
import HudPlugin from "./Hud/HudPlugin";
import InitPlugin from "./Init/InitPlugin";
import LevelPlugin from "./Level/LevelPlugin";
import NextLevelSignal from "./Level/Signals/NextLevelSignal";
import LogoPlugin from "./Logo/LogoPlugin";
import MainMenuPlugin from "./MainMenu/MainMenuPlugin";
import ExitMenuSignal from "./MainMenu/Signals/ExitMenuSignal";
import PlayerPlugin from "./Player/PlayerPlugin";
import ShakerPlugin from "./Shaker/ShakerPlugin";
import SoundPlugin from "./Sound/SoundPlugin";
import GameLoopState from "./States/GameLoopState";
import WinPlugin from "./Win/WinPlugin";

export default function GamePlugin(builder: Builder) {
  builder.plugin(InitPlugin);
  builder.plugin(CurtainsPlugin);
  builder.plugin(LogoPlugin);
  builder.plugin(MainMenuPlugin);
  builder.plugin(LevelPlugin);
  builder.plugin(PlayerPlugin);
  builder.plugin(DeathPlugin);
  builder.plugin(WinPlugin);
  builder.plugin(SoundPlugin);
  builder.plugin(EnemyPlugin);
  builder.plugin(BatPlugin);
  builder.plugin(HudPlugin);
  builder.plugin(ShakerPlugin);

  builder.resource(new GameStateResource());

  // Some 2B2D built-in systems are disabled by default. They aren't needed
  // during menus and such, so only enable them during the gameloop state.
  builder.schedule.update(GameLoopState, ApplyAaabbPhysics);
  builder.schedule.update(GameLoopState, DetectCollisionTargetHits);

  builder.schedule.cleanup(GameLoopState, GameStateCleanup);

  // Coordinating between states
  builder.signals.handle(ExitMenuSignal, (update: Update) => {
    const res = update.resource(GameStateResource);

    res.health = Config.MaxHealth;
    res.level = Config.StartLevelId;

    update.schedule.enter(GameLoopState);

    Curtains.Open(update, 'Game');
  });

  builder.signals.handle(DeathScreenExitSignal, (update: Update) => {
    const res = update.resource(GameStateResource);

    res.health = Config.MaxHealth;

    update.schedule.enter(GameLoopState);

    Curtains.Open(update, 'Game');
  });

  builder.signals.handle(NextLevelSignal, (update: Update) => {
    update.schedule.enter(GameLoopState);
    Curtains.Open(update, 'Game');
  });
}