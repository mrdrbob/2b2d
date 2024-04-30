import Asset from "../Assets/Asset";
import { Handle } from "../Handle";
import { System } from "../System";
import Update from "../Update";
import IndexCounter from "../Util/IndexCounter";
import Resource from "./Resource";

// Commands
type PlayAudio = {
  type: 'play',
  handle: Handle,
  gain: number,
  loop: boolean,
  offset: number | undefined,
  duration: number | undefined
}

type LoadAudio = {
  type: 'load',
  path: string,
  asset: Asset<AudioBuffer>
}

type AudioCommand = LoadAudio | PlayAudio;

interface AudioRequest {
  waitForReady: boolean,
  id: number,
  command: AudioCommand
}

interface PlayingAudio {
  source: AudioBufferSourceNode,
  gainNode: GainNode
}



export default class AudioResource implements Resource {
  static readonly NAME: string = 'AudioResource';
  readonly name: string = AudioResource.NAME;

  private index = new IndexCounter();
  audioContext: AudioContext;
  gainNode: GainNode;

  private queue = new Array<AudioRequest>();
  private playingAudio = new Map<number, PlayingAudio>();


  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    this.gainNode.connect(this.audioContext.destination);
  }

  load(handle: Handle, path: string) {
    const asset = new Asset<AudioBuffer>(handle);
    this.queue.push({
      command: { type: 'load', path, asset: asset },
      id: this.index.next(),
      waitForReady: true
    });
    return asset;
  }

  play(handle: Handle, waitForReady: boolean = false, gain: number = 1, loop: boolean = false, offset: number | undefined = undefined, duration: number | undefined = undefined) {
    const id = this.index.next();
    this.queue.push({ id, waitForReady, command: { type: 'play', handle, gain, loop, offset, duration } });
    return id;
  }

  fadeOut(soundId: number, time: number) {
    const playing = this.playingAudio.get(soundId);

    if (!playing) {
      // It hasn't started, so just don't play it if it's queued
      this.queue = this.queue.filter(x => x.id != soundId);
      return;
    }

    // Otherwise, fade it out
    playing.gainNode.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + time);
    playing.source.stop(this.audioContext.currentTime + time);
    this.playingAudio.delete(soundId);
  }

  stop(soundId: number) {
    const playing = this.playingAudio.get(soundId);

    if (!playing) {
      // It hasn't started, so just don't play it if it's queued
      this.queue = this.queue.filter(x => x.id != soundId);
      return;
    }

    // Otherwise, fade it out
    playing.source.stop(this.audioContext.currentTime);
    this.playingAudio.delete(soundId);
  }

  private async _load(command: LoadAudio) {
    const res = await fetch(command.path);
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    command.asset.complete(audioBuffer);
  }

  private _play(update: Update, id: number, waitForReady: boolean, command: PlayAudio) {
    const assets = update.assets();

    const asset = assets.get<AudioBuffer>(command.handle);
    if (!asset)
      return false;

    const audio = asset.get();
    if (!audio)
      return waitForReady;

    let source = this.audioContext.createBufferSource();
    source.buffer = audio;

    source.addEventListener('ended', (_ev) => {
      this.playingAudio.delete(id);
    });

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(command.gain, this.audioContext.currentTime);

    source.connect(gainNode);
    gainNode.connect(this.gainNode);

    source.loop = command.loop;

    source.start(this.audioContext.currentTime, command.offset, command.duration);

    this.playingAudio.set(id, { gainNode, source });

    return false;
  }

  system(): System {
    return (_update) => {
      this.tick(_update);
    };
  }

  tick(update: Update) {
    if (this.queue.length === 0)
      return;

    if (this.audioContext.state === 'suspended')
      this.audioContext.resume();

    const isReady = this.audioContext.state === 'running';
    if (!isReady) {
      this.queue = this.queue.filter(x => x.waitForReady);
      return;
    }

    const next = new Array<AudioRequest>();

    for (const request of this.queue) {
      switch (request.command.type) {
        case 'load':
          this._load(request.command);
          break;
        case 'play':
          const reAdd = this._play(update, request.id, request.waitForReady, request.command);
          if (reAdd)
            next.push(request);
          break;
        default:
          throw new Error(`Unkown audio command type`);
      }
    }

    this.queue = next;
  }
}  
