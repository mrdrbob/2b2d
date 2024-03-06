import Position, { PositionComponent } from "../Components/Position";
import Sprite, { SpriteComponent } from "../Components/Sprite";
import TweenChain, { TweenChainComponent } from "../Components/TweenChain";
import Update from "../Update";

export default function UpdateTweenChains(update:Update) {
  const query = update.query([ TweenChain.name ]);

  const delta = update.delta();

  for (const item of query) {
    const [ chain ] = item.components as [ TweenChainComponent ];
    if (chain.steps.length === 0)
      continue;

    let entityId = item.entity;
    if (chain.entity !== undefined) {
      const resolved = update.resolveEntity(chain.entity);
      if (!resolved)
        continue;
      entityId = resolved;
    }

    chain.time += delta;
    const lastStep = chain.steps[chain.steps.length - 1];
    if (chain.time >= lastStep.end.time) {
      update.despawn(entityId);
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

    const position = update.get<PositionComponent>(entityId, Position.name);
    const sprite = update.get<SpriteComponent>(entityId, Sprite.name);

    if (position && step.end.position) {
      if (!step.start.position) {
        step.start.position = position.pos;
      }

      const posDelta = step.end.position.sub(step.start.position);
      position.pos = step.start.position.add(posDelta.scalarMultiply(progress));
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
  }
}