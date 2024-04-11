
import Asset, { Handle } from "../Asset";
import Resource from "../Resource";
import Ticker from "../Ticker";
import Update from "../Update";

type DecodeAudio = {
  type: 'decode',
  handle: Handle
}

type PlayAudio = {
  type: 'play',
  handle: Handle,
  gain: number,
  loop: boolean,
}

type AudioCommand = DecodeAudio | PlayAudio;

interface AudioRequest {
  waitForReady: boolean,
  id: number,
  command: AudioCommand
}


interface PlayingAudio {
  source: AudioBufferSourceNode,
  gainNode: GainNode
}

export default class AudioResource implements Resource, Ticker {
  public static readonly NAME: string = 'AudioResource';
  readonly name = AudioResource.NAME;

  private index = 0;
  audioContext: AudioContext;
  gainNode: GainNode;

  private queue = new Array<AudioRequest>();
  private playingAudio = new Map<number, PlayingAudio>();
  private decodedAudio = new Map<Handle, Asset<AudioBuffer>>();

  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    this.gainNode.connect(this.audioContext.destination);
  }

  decodeAudio(handle:Handle) {
    const id = ++this.index;
    this.queue.push({ id, waitForReady: true, command: { type: 'decode', handle } });
    return id;
  }

  play(handle:Handle, waitForReady:boolean = false, gain: number = 1, loop: boolean = false) {
    const id = ++this.index;
    this.queue.push({ id, waitForReady, command: { type: 'play', handle, gain, loop } });
    return id;
  }

  fadeOut(soundId:number, time:number) {
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

  stop(soundId:number) {
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

  private _decodeAudio(update: Update, handle:string) {
    let decodedAudio = this.decodedAudio.get(handle);
    if (decodedAudio) {
      return decodedAudio;
    }

    const assets = update.assets();
    const asset = assets.get<ArrayBuffer>(handle);
    if (!asset || !asset.isLoaded())
      return;

    const decodedName = `${asset.name}-decoded-audio`;
    const buffer = asset.get()!;
    const promise = this.audioContext.decodeAudioData(buffer);
    decodedAudio = new Asset<AudioBuffer>(decodedName, promise);
    this.decodedAudio.set(asset.name, decodedAudio);

    return decodedAudio;
  }

  _play(update:Update, id:number, waitForReady:boolean, command:PlayAudio) {
    const assets = update.assets();

    const asset = assets.get<ArrayBuffer>(command.handle);
    if (!asset)
      return false;

    const isLoaded = asset.isLoaded();
    if (!isLoaded) {
      return waitForReady;
    }


    let decodedAudio = this._decodeAudio(update, command.handle);
    if (!decodedAudio)
      return false;
    
    const audioBuffer = decodedAudio.get();
    if (!audioBuffer) {
      return waitForReady;
    }

    let source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    source.addEventListener('ended', (_ev) => {
      this.playingAudio.delete(id);
    });

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(command.gain, this.audioContext.currentTime);

    source.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    source.loop = command.loop;

    source.start(this.audioContext.currentTime);

    this.playingAudio.set(id, { gainNode, source });
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
        case 'decode':
          const decoded = this._decodeAudio(update, request.command.handle);
          if (!decoded)
            next.push(request);
          break;
        case 'play':
          const readd = this._play(update, request.id, request.waitForReady, request.command);
          if (readd)
            next.push(request);
          break;
        default:
          throw new Error(`Unkown audio command type`);
      }
    }

    this.queue = next;
  }
}
