import { Component } from "../Component";

export interface FrameData {
  startTime: number,
  endTime: number,
  frame: string
}

export interface AnimationData {
  totalTime: number,
  frames: FrameData[]
};

export default class Animated implements Component {
  public static NAME:string = 'Animated';
  name(): string { return Animated.NAME; }

  public animation:AnimationData | undefined;
  public previousTag:string | undefined;
  public time:number = 0;

  constructor(public tag:string | undefined) {}
}