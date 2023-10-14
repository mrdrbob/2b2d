import Assets from "../../Assets";
import KineticBody from "../../Engine/Components/KineticBody";
import Position from "../../Engine/Components/Position";
import Velocity from "../../Engine/Components/Velocity";
import Vec2 from "../../Engine/Math/Vec2";
import AudioServerResource from "../../Engine/Resources/AudioServerResource";
import Update from "../../Engine/Update";
import AABB from "../../Engine/Utils/AABB";
import States from "../../States";
import { Player } from "../Player/Components";
import { FlagCollider } from "./Components";

// TODO: This is basically copy/paste from "Water" systems. Make this generic?
export function checkForFlagCollision(update:Update) {
  const playerQuery = update.queryCached('checkForFlagCollision:player', [ Player.NAME, Position.NAME, KineticBody.NAME, Velocity.NAME ]);
  if (playerQuery.length == 0)
    return;

  const [ _player, playerPos, body, velocity ] = playerQuery[0].components as [ Player, Position, KineticBody, Velocity ];
  const globalPosition = playerPos.globalPosition();

  const colliders = update.queryCached('checkForFlagCollision:water', [ FlagCollider.NAME, Position.NAME ]);
  for (const entity of colliders) {
    const [ collider, pos ] = entity.components as [ FlagCollider, Position ];
    const aabb = new AABB(pos.globalPosition(), collider.size.add(body.size));
    if (aabb.contains(globalPosition)) {
      velocity.velocity = Vec2.ZERO;
      
      const audio = update.resource<AudioServerResource>(AudioServerResource.NAME);
      audio.play(Assets.SOUND.FLAG);
      update.exitState(States.GAME);
      update.enterState(States.GAME_TO_NEXT_STAGE);
      return;
    }
  } 
}