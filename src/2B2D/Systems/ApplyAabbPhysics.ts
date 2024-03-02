import KineticBody, { KineticBodyComponent } from "../Components/KineticBody";
import Position, { PositionComponent } from "../Components/Position";
import StaticBody, { StaticBodyComponent } from "../Components/StaticBody";
import Velocity, { VelocityComponent } from "../Components/Velocity";
import Weight, { WeightComponent } from "../Components/Weight";
import Vec2 from "../Math/Vec2";
import Update from "../Update";
import AABB from "../Utils/AABB";

const COLLISION_BIAS = 0.1;

export default function ApplyAabbPhysics(update: Update) {
  const weightQuery = update.query([Velocity.name, Weight.name]);
  const delta = update.delta();

  for (const entity of weightQuery) {
    const [vel, weight] = entity.components as [VelocityComponent, WeightComponent];
    vel.velocity = new Vec2(vel.velocity.x, vel.velocity.y + weight.gravity);
  }

  const kineticsQuery = update.query([Position.name, Velocity.name, KineticBody.name]);
  const staticBodyQuery = update.query([Position.name, StaticBody.name]);

  for (const kineticEntity of kineticsQuery) {
    const [kinPos, kinVel, kineticBody] = kineticEntity.components as [PositionComponent, VelocityComponent, KineticBodyComponent];
    const kinBody = new AABB(kinPos.pos, kineticBody.size);
    let isGrounded = false;

    // Create all the AABB static body representations
    let /* the */ bodies /* hit the floor */ = staticBodyQuery.map(staticEntity => {
      const [staticPos, staticBody] = staticEntity.components as [PositionComponent, StaticBodyComponent];
      const statBody = new AABB(staticPos.pos, staticBody.size.add(kinBody.size));
      return { entity: staticEntity.entity, body: statBody };
    });

    // Cast the velocity over time
    let ray = kinVel.velocity.scalarMultiply(delta);

    // Gather all collisions
    let collisions = bodies.map(body => body.body.detectRayCollision(kinBody.pos, ray))
      .filter(x => x != null)
      .map(y => y!);

    // Sort them for the closest impacts are first
    collisions.sort((a, b) => a.moment - b.moment);

    let maxTries = 10; // Limit this to 10 tries. After that we're probably stuck in an infinite loop.
    while (collisions.length > 0 && maxTries > 0) {
      const collision = collisions[0];

      const velocityAdjustment = collision.normal.multiply(ray.abs()).scalarMultiply(1 - collision.moment);
      ray = ray.add(velocityAdjustment);

      // A nudge in the direction of the normal
      const positionAdjustment = collision.normal.scalarMultiply(COLLISION_BIAS);
      kinBody.pos = kinBody.pos.add(positionAdjustment);

      isGrounded = isGrounded || collision.normal.y > 0;

      // Now we need to pull the collisions again and retry
      collisions = bodies.map(body => body.body.detectRayCollision(kinBody.pos, ray))
        .filter(x => x != null)
        .map(y => y!);

      collisions.sort((a, b) => a.moment - b.moment);

      maxTries--;
    }

    if (maxTries <= 0) { console.warn('Reached max tries'); return; }

    // Apply transformation
    kinBody.pos = kinBody.pos.add(ray);
    kinVel.velocity = ray.scalarMultiply(1 / delta);
    kinPos.pos = kinBody.pos;
    kineticBody.isGrounded = isGrounded;
  }
}