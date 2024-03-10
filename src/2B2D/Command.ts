import Component from "./Component";
import { ResolvableEntity } from "./Entity";
import { CreateRenderer } from "./Rendering/RenderingSystem";
import Resource from "./Resource";
import Signal from "./Signal";
import Ticker from "./Ticker";

export type Command =
  SpawnEntityCommand |
  DespawnEntityCommand |
  ExitStateCommand |
  EnterStateCommand |
  TriggerSignalCommand |
  AddRendererCommand |
  RemoveRendererCommand |
  AddResource |
  AddTicker;

export type SpawnEntityCommand = {
  type: 'spawn',
  components: Array<Component | string>,
  resolvable: ResolvableEntity
}

export type DespawnEntityCommand = {
  type: 'despawn',
  entity: number;
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

export type AddTicker = {
  type: 'add-ticker',
  ticker: Ticker
}
