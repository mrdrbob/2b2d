import Asset from "../Asset";
import Resource from "../Resource";
import AssetsResource from './AssetsResource';

interface PlayingAudio {
  source: AudioBufferSourceNode,
  gainNode: GainNode
}

export default class AudioServerResource implements Resource {
  public static readonly NAME:string = 'AudioServerResource';
  name() { return  AudioServerResource.NAME; }

  assets: AssetsResource;
  audioContext: AudioContext;
  gainNode: GainNode;

  private playingAudios:Map<number, PlayingAudio> = new Map<number, PlayingAudio>();
  private currentId:number = 0;

  constructor(assets:AssetsResource) {
    this.assets = assets;
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

  loadAudioSource(name:string, url:string) {
    const promise = this._loadAudio(url);
    const asset = new Asset(name, promise);
    this.assets.add(asset);
  }

  setGain(vol:number) {
    this.gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime);
  }

  play(name:string, gain?:number, loop?:boolean) {
    const asset = this.assets.get<AudioBuffer>(name);
    if (!asset)
      return;
    const buffer = asset.get();
    if (!buffer)
      return;

    let source = this.audioContext.createBufferSource();
    source.buffer = buffer;

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

  fadeOut(soundId:number, time:number) {
    const audio = this.playingAudios.get(soundId);
    if (!audio)
      return;
    
    audio.gainNode.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + time);
    audio.source.stop(this.audioContext.currentTime + time);
  }
}