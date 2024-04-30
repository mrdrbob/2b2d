import { Entity } from "../../../2B2D/Entity";
import Signal from "../../../2B2D/Signal";
import Future from "../../../2B2D/Util/Future";

export default class CameraSpawnedSignal implements Signal {
  sender: string | undefined;
  static readonly NAME: string = 'CameraSpawnedSignal';
  readonly name: string = CameraSpawnedSignal.NAME;

  constructor(public entity: Future<Entity>) {

  }
}