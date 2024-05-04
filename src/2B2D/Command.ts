import Component from "./Components/Component";
import { Entity } from "./Entity";
import { CreateRenderer } from "./Rendering/Renderer";
import Resource from "./Resources/Resource";
import Signal from "./Signal";
import { System } from "./System";
import Future from "./Util/Future";

export type Command =
  SpawnEntityCommand |
  DespawnEntityCommand |
  ExitStateCommand |
  EnterStateCommand |
  TriggerSignalCommand |
  AddRendererCommand |
  RemoveRendererCommand |
  AddResource |
  AddFixedSystem;

export type SpawnEntityCommand = {
  type: 'spawn',
  components: Array<Component>,
  future: Future<Entity>
}

export type DespawnEntityCommand = {
  type: 'despawn',
  entity: Entity;
}

export type ExitStateCommand = {
  type: 'exit-state',
  state: string
}

export type EnterStateCommand = {
  type: 'enter-state',
  state: string
}

export type TriggerSignalCommand = {
  type: 'signal',
  signal: Signal
}

export type AddRendererCommand = {
  type: 'add-renderer',
  create: CreateRenderer
}

export type RemoveRendererCommand = {
  type: 'remove-renderer',
  name: string
}

export type AddResource = {
  type: 'add-resource',
  resource: Resource
}

export type AddFixedSystem = {
  type: 'add-fixed-system',
  system: System
}
