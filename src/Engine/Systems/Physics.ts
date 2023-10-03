import KineticBody from "../Components/KineticBody";
import Position from "../Components/Position";
import StaticBody from "../Components/StaticBody";
import Velocity from "../Components/Velocity";
import Weight from "../Components/Weight";
import Vec2 from "../Math/Vec2";
import Update from "../Update";
import AABB from "../Utils/AABB";

const COLLISION_BIAS = 0.1;

export function applyPhysics(update: Update) {
  const weightQuery = update.queryCached('applyPhysicsWeight', [Velocity.NAME, Weight.NAME]);

  for (const entity of weightQuery) {
    const [vel, weight] = entity.components as [Velocity, Weight];
    vel.velocity = new Vec2(vel.velocity.x, vel.velocity.y + weight.gravity);
  }

  const kineticsQuery = update.queryCached('applyPhysicsKinetic', [Position.NAME, Velocity.NAME, KineticBody.NAME]);
  const staticBodyQuery = update.queryCached('applyPhysicsStatic', [Position.NAME, StaticBody.NAME]);

  for (const kineticEntity of kineticsQuery) {
    const [kinPos, kinVel, kineticBody] = kineticEntity.components as [Position, Velocity, KineticBody];
    const kinBody = new AABB(kinPos.pos, kineticBody.size);
    let isGrounded = false;

    let velocity = kinVel.velocity;

    // Create all the AABB static body representations
    let /* the */ bodies /* hit the floor */ = staticBodyQuery.map(staticEntity => {
      const [staticPos, staticBody] = staticEntity.components as [Position, StaticBody];
      const statBody = new AABB(staticPos.pos, staticBody.size.add(kinBody.size));
      return { entity: staticEntity.entity, body: statBody };
    });

    // Gather all collisions
    let collisions = bodies.map(body => body.body.detectRayCollision(kinBody.pos, velocity))
      .filter(x => x != null)
      .map(y => y!);

    // Sort them
    collisions.sort((a, b) => a.moment - b.moment);

    let maxTries = 10; // Limit this to 10 tries. After that we're probably stuck in an infinite loop.
    while (collisions.length > 0 && maxTries > 0) {
      const collision = collisions[0];

      const velocityAdjustment = collision.normal.multiply(velocity.abs()).scalarMultiply(1 - collision.moment);
      velocity = velocity.add(velocityAdjustment);

      // A nudge in the direction of the normal
      const positionAdjustment = collision.normal.scalarMultiply(COLLISION_BIAS);
      kinBody.pos = kinBody.pos.add(positionAdjustment);

      isGrounded = isGrounded || collision.normal.y > 0;

      // Now we need to pull the collisions again and retry
      collisions = bodies.map(body => body.body.detectRayCollision(kinBody.pos, velocity))
        .filter(x => x != null)
        .map(y => y!);

      collisions.sort((a, b) => a.moment - b.moment);

      maxTries--;
    }

    if (maxTries <= 0) { console.log('Reached max tries'); return; }


    // Apply transformation
    kinBody.pos = kinBody.pos.add(velocity);
    kinVel.velocity = velocity;
    kinPos.pos = kinBody.pos;
    kineticBody.isGrounded = isGrounded;
  }

}