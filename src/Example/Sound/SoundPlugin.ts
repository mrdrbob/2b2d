import Builder from "../../2B2D/Builder";
import Signal from "../../2B2D/Signal";
import Update from "../../2B2D/Update";
import EnemyCollision from "../Enemy/Signals/EnemyCollisionSignal";
import GameAssets from "../GameAssets";
import { PlayerJumpedSignal } from "../Player/PlayerPlugin";
import PlayerDied from "../Player/Signals/PlayerDiedSignal";
import PlayerTouchedFlag from "../Player/Signals/PlayerTouchedFlag";
import { PlayerDamangedSignal } from "../Player/Systems/TakeEnemyDamage";

export default function SoundPlugin(builder: Builder) {
  builder.handle(PlayerJumpedSignal, playerJumped);
  builder.handle(PlayerDamangedSignal, playerHurt);
  builder.handle(PlayerDied.NAME, playerDied);
  builder.handle(PlayerTouchedFlag, touchedFlag);
  builder.handle(EnemyCollision.NAME, stomps);
}

function playerJumped(update: Update) {
  const audio = update.audio();
  audio.play(GameAssets.Sounds.Jump.Handle, true, 0.5);
}

function playerHurt(update: Update) {
  const audio = update.audio();
  audio.play(GameAssets.Sounds.Hurt.Handle, true, 0.7);
}

function playerDied(update: Update) {
  const audio = update.audio();
  audio.play(GameAssets.Sounds.Died.Handle, true, 0.7);
}

function touchedFlag(update: Update) {
  const audio = update.audio();
  audio.play(GameAssets.Sounds.Flag.Handle, true, 0.7);
}

function stomps(update: Update, signals: Signal[]) {
  for (const collision of signals as EnemyCollision[]) {
    if (!collision.isStomp)
      continue;

    const audio = update.audio();
    audio.play(GameAssets.Sounds.Drop.Handle, true, 0.7);
    return;
  }
}