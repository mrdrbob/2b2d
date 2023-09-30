import Assets from "../Assets";
import Animated from "../Engine/Components/Animated";
import Position from "../Engine/Components/Position";
import Sprite from "../Engine/Components/Sprite";
import Tilemap from "../Engine/Components/Tilemap";
import Velocity from "../Engine/Components/Velocity";
import Vec2 from "../Engine/Math/Vec2";
import CameraResource from "../Engine/Resources/CameraResource";
import KeysResource from "../Engine/Resources/KeysResource";
import Update from "../Engine/Update";
import Layers from "../Layers";
import { MoveAroundComponent } from "./GameComponents";


export function spawnGame(update:Update) {
  update.spawn([
    Position.fromXY(-50, -100),
    new Tilemap(Layers.BACKGROUND, Assets.CITY_TEXTURE, Assets.CITY_TILEMAP, Assets.CITY_ATLAS)
  ]);

  update.spawn([
    Position.fromXY(0, 0),
    new Sprite(Assets.GUY_TEXTURE, Assets.GUY_ATLAS, Layers.FOREGROUND, '0'),
    new MoveAroundComponent(),
    new Animated('IdleWest'),
    Velocity.zero(),
  ]);

}

const speed:number = 0.01;

const idleTags = {
  north: 'IdleNorth',
  south: 'IdleSouth',
  east: 'IdleEast',
  west: 'IdleWest',
  unknown: 'IdleSouth',
};

const walkTags = {
  north: 'WalkNorth',
  south: 'WalkSouth',
  east: 'WalkEast',
  west: 'WalkWest',
  unknown: 'WalkSouth',
};


export function movePlayerAround(update:Update) {
  const keys = update.resource<KeysResource>(KeysResource.NAME);

  const isLeft = keys.isKeyDown('ArrowLeft');
  const isRight = keys.isKeyDown('ArrowRight');
  const isUp = keys.isKeyDown('ArrowUp');
  const isDown = keys.isKeyDown('ArrowDown');

  const query = update.queryCached('moveMenuAround', [Velocity.NAME, Position.NAME, Animated.NAME, MoveAroundComponent.NAME]);
  for (const entity of query) {
    const [ vel, pos, sprite, movement ] = entity.components as [Velocity, Position, Animated, MoveAroundComponent];

    let newVel = vel.velocity;
    if (isLeft) {
      newVel = newVel.add(new Vec2(-speed, 0)); 
      movement.facing = new Vec2(-1, 0);
    }
    if (isRight) {
      newVel = newVel.add(new Vec2(speed, 0));
      movement.facing = new Vec2(1, 0);
    }
    if (isUp) { 
      newVel = newVel.add(new Vec2(0, speed));
      movement.facing = new Vec2(0, -1);
    }
    if (isDown) {
      newVel = newVel.add(new Vec2(0, -speed));
      movement.facing = new Vec2(0, 1);
    }

    vel.velocity = newVel.scalarMultiply(0.9);
    if (Math.abs(vel.velocity.x) < 0.001 && Math.abs(vel.velocity.y) < 0.01) {
      sprite.tag = movement.facing.matchDirection(idleTags);
    } else {
      sprite.tag = movement.facing.matchDirection(walkTags);
    }

    pos.pos = pos.pos.add(vel.velocity.scalarMultiply(update.deltaTime()));
  }
}

export function cameraFollowPlayer(update:Update) {
  const query = update.queryCached('cameraFollowPlayer', [Velocity.NAME, Position.NAME]);
  const camera = update.resource<CameraResource>(CameraResource.NAME);
 
  for (const player of query) {
    const [ _vel, pos ] = player.components as [ Velocity, Position ];
    camera.position = pos.pos;
  }
}