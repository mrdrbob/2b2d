import Builder from "../../2B2D/Builder";
import Signal from "../../2B2D/Signal";
import Update from "../../2B2D/Update";
import EnemyCollision, { EnemyCollisionSignal } from "../Enemy/Signals/EnemyCollisionSignal";
import GameAssets from "../GameAssets";
import { PlayerJumpedSignal } from "../Player/PlayerPlugin";
import PlayerDied from "../Player/Signals/PlayerDiedSignal";
import PlayerTouchedFlag from "../Player/Signals/PlayerTouchedFlag";
import { PlayerDamangedSignal } from "../Player/Systems/TakeEnemyDamage";

export default function SoundPlugin(builder:Builder) {
  builder.handle(PlayerJumpedSignal, playerJumped);
  builder.handle(PlayerDamangedSignal, playerHurt);
  builder.handle(PlayerDied.name, playerDied);
  builder.handle(PlayerTouchedFlag, touchedFlag);
  builder.handle(EnemyCollision.name, stomps);
}

function playerJumped(update: Update) {
  const audio = update.audio();
  audio.play(update, GameAssets.Sounds.Jump.Handle);
}

function playerHurt(update:Update) {
  const audio = update.audio();
  audio.play(update, GameAssets.Sounds.Hurt.Handle);
}

function playerDied(update:Update) {
  const audio = update.audio();
  audio.play(update, GameAssets.Sounds.Died.Handle);
}

function touchedFlag(update:Update) {
  const audio = update.audio();
  audio.play(update, GameAssets.Sounds.Flag.Handle);
}

function stomps(update:Update, signals:Signal[]) {
  for (const collision of signals as EnemyCollisionSignal[]) {
    if (!collision.isStomp)
      continue;

    const audio = update.audio();
    audio.play(update, GameAssets.Sounds.Drop.Handle);
    return;
  }
}