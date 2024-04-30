import Signal from "../../../2B2D/Signal";

export default class CurtainMovementCompleteSignal implements Signal {
  static readonly NAME: string = 'CurtainMovementCompleteSignal';
  readonly name: string = CurtainMovementCompleteSignal.NAME;

  constructor(
    public sender: string,
    public opened: boolean
  ) { }
}
