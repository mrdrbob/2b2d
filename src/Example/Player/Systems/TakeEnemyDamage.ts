import Position from "../../../2B2D/Components/Position";
import Signal from "../../../2B2D/Signal";
import Update from "../../../2B2D/Update";
import EnemyCollisionSignal from "../../Enemy/Signals/EnemyCollisionSignal";
import GameStateResouce from "../../GameStateResource";
import Player from "../Components/Player";
import PlayerDied from "../Signals/PlayerDiedSignal";

export const PlayerDamangedSignal = 'PlayerDamangedSignal';

export default function TakeEnemyDamage(update:Update, signals:Signal[]) {
  if (signals.length === 0)
    return;

  // Just going to handle a single enemy. Not ideal.
  const signal = signals[0] as EnemyCollisionSignal;
  if (signal.isStomp)
    return;

  const query = update.single([ Player.NAME, Position.NAME ]);
  if (!query)
    return;
  const [ player, position ] = query.components as [ Player, Position ];

  if (player.invincibleTimeRemaining > 0)
    return;

  const gameState = update.resource<GameStateResouce>(GameStateResouce.NAME);
  gameState.health -= signal.damage;
  
  if (gameState.health <= 0) {
    // Oh we dead. Send a signal to trigger the ghost and level end.
    const globalPos = update.resolvePosition(query.entity, position);
    update.despawn(query.entity);
    update.signals.send(new PlayerDied(globalPos));
  }

  player.invincibleTimeRemaining = 2000;
  update.signals.send(PlayerDamangedSignal);
}
