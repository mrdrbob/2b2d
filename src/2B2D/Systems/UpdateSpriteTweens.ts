import Position from "../Components/Position";
import Sprite from "../Components/Sprite";
import SpriteTween from "../Components/SpriteTween";
import Update from "../Update";

export default function UpdateSpriteTweens(update: Update) {
  const query = update.ecs.query(SpriteTween);

  const delta = update.delta;

  for (const item of query) {
    const [chain] = item.components;
    if (chain.steps.length === 0)
      continue;

    let entityId = item.entity;
    if (chain.entity !== undefined) {
      const resolved = update.resolve.entity(chain.entity);
      if (!resolved)
        continue;
      entityId = resolved;
    }

    chain.time += delta;
    const lastStep = chain.steps[chain.steps.length - 1];
    if (chain.time >= lastStep.end.time) {
      if (chain.loop) {
        chain.time = 0;
        continue;
      }

      update.despawn(item.entity);
      if (chain.signal)
        update.signals.send(chain.signal);
      continue;
    }

    const step = chain.steps.find(x => chain.time >= x.start.time && chain.time < x.end.time);
    if (!step)
      continue;

    const timeInTask = chain.time - step.start.time;
    const deltaTime = step.end.time - step.start.time;
    const progress = timeInTask / deltaTime;

    const position = update.ecs.get(entityId, Position);
    const sprite = update.ecs.get(entityId, Sprite);

    if (position && step.end.position) {
      if (!step.start.position) {
        step.start.position = position.position;
      }

      const posDelta = step.end.position.sub(step.start.position);
      position.position = step.start.position.add(posDelta.scalarMultiply(progress));
    }

    if (sprite && step.end.color) {
      if (!step.start.color) {
        step.start.color = sprite.color;
      }

      const colorDelta = step.end.color.sub(step.start.color);
      sprite.color = step.start.color.add(colorDelta.scalarMultiply(progress));
    }

    if (sprite && step.end.scale) {
      if (!step.start.scale) {
        step.start.scale = sprite.scale;
      }

      const scaleDelta = step.end.scale.sub(step.start.scale);
      sprite.scale = step.start.scale.add(scaleDelta.scalarMultiply(progress));
    }

    if (sprite && step.end.radians) {
      if (!step.start.radians) {
        step.start.radians = sprite.radians;
      }

      const rotationDelta = step.end.radians - step.start.radians;
      sprite.radians = step.start.radians + (rotationDelta * progress);
    }
  }
}