import Asset, { Handle } from "../Asset";
import Resource from "../Resource";
import Update from "../Update";

interface PlayingAudio {
  source: AudioBufferSourceNode,
  gainNode: GainNode
}

export class AudioResource implements Resource {
  name = 'AudioResource';
  audioContext: AudioContext;
  gainNode: GainNode;

  private playingAudios:Map<number, PlayingAudio> = new Map<number, PlayingAudio>();
  private currentId:number = 0;

  constructor() {
    this.audioContext = new AudioContext();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  private async _loadAudio(url:string) {
    const res = await fetch(url);
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  loadAudio(handle:string, url:string) {
    const promise = this._loadAudio(url);
    const asset = new Asset(handle, promise);
    return asset;
  }

  setGain(vol:number) {
    this.gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
  }

  play(update:Update, handle:Handle, gain?:number, loop?:boolean) {
    const assets = update.assets();

    const asset = assets.get<AudioBuffer>(handle);
    if (!asset)
      return;

    if (!asset.isLoaded())
      return;

    const buffer = asset.get();
    if (!buffer)
      return;

    let source = this.audioContext.createBufferSource();
    source.buffer = asset.get();

    const gainNode = this.audioContext.createGain();
    if (gain !== undefined) {
      gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
    }

    source.connect(gainNode);
    gainNode.connect(this.gainNode);
    if (loop !== undefined) {
      source.loop = loop;
    }

    const id = this.currentId++;
    this.playingAudios.set(id, {
      gainNode,
      source
    });
    
    source.addEventListener('ended', (_ev) => {
      this.playingAudios.delete(id);
    });
  
    source.start(this.audioContext.currentTime);
    
    return id;
  }
}