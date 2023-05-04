import SwitchInput from './src/components/SwitchInput';
import Light from './src/components/Light';
import KnobInput from './src/components/KnobInput';

import './main.scss';
import LinearMap1d from "./src/models/LinearMap1d";
import Interval1d from "./src/models/Interval1d";

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const gainNode = audioCtx.createGain();
const delayBuss = audioCtx.createGain();

const delayGainRatio = 0.6;
const getDelayGain = gain => delayGainRatio * gain;

const delay1 = audioCtx.createDelay();
const delay1Level = audioCtx.createGain();
delay1Level.gain.setValueAtTime(0.6, audioCtx.currentTime);

const delay2 = audioCtx.createDelay();
const delay2Level = audioCtx.createGain();
delay2Level.gain.setValueAtTime(0.3, audioCtx.currentTime);

const delay3 = audioCtx.createDelay();
const delay3Level = audioCtx.createGain();
delay3Level.gain.setValueAtTime(0.4, audioCtx.currentTime);

delay1.connect(delay1Level).connect(delayBuss);
delay2.connect(delay2Level).connect(delayBuss);
delay3.connect(delay3Level).connect(delayBuss);

const delayTime = 0.3;
delay1.delayTime.setValueAtTime(delayTime, audioCtx.currentTime);
delay2.delayTime.setValueAtTime(delayTime*(8/3), audioCtx.currentTime);
delay3.delayTime.setValueAtTime(delayTime*(13/5), audioCtx.currentTime);

gainNode.connect(audioCtx.destination);


let oscillator;
let oscillatorDetuned;
let hasDelay = false;

const play = () => {
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  delayBuss.gain.setValueAtTime(0, audioCtx.currentTime);

  oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.connect(gainNode);
  oscillator.connect(delay1);
  oscillator.connect(delay2);
  oscillator.connect(delay3);
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
  oscillator.start();

  oscillatorDetuned = audioCtx.createOscillator();
  oscillatorDetuned.type = 'sine';
  const oscillatorDetunedGain = audioCtx.createGain();
  oscillatorDetunedGain.gain.setValueAtTime(0.6, audioCtx.currentTime)


  setInterval(() => {
    oscillatorDetuned.detune.setValueAtTime( 40*Math.sin((Math.PI*2/(delayTime/4))*audioCtx.currentTime), audioCtx.currentTime);
  }, audioCtx.baseLatency);

  // oscillatorDetuned.connect(oscillatorDetunedGain).connect(gainNode);
  oscillatorDetuned.connect(oscillatorDetunedGain);
  oscillatorDetuned.connect(delay1);
  oscillatorDetuned.connect(delay2);
  oscillatorDetuned.connect(delay3);
  oscillatorDetuned.frequency.setValueAtTime(440, audioCtx.currentTime);
  oscillatorDetuned.start();

  gainNode.gain.linearRampToValueAtTime(knobValueToVolume(volumeKnob.getValue()), audioCtx.currentTime);
  delayBuss.gain.linearRampToValueAtTime(getDelayGain(knobValueToVolume(volumeKnob.getValue())), audioCtx.currentTime);
};

const pause = () => {
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
  delayBuss.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);

  oscillator.stop(audioCtx.currentTime + 1);
  oscillatorDetuned.stop(audioCtx.currentTime + 1);
};

let mode = 'THRM';

const freqMapping = new LinearMap1d({

  domain: new Interval1d({
    min: 0,
    max: 100,
  }),
  range: new Interval1d({
    min: 440,
    max: 880,
  }),
});

const notes = [440, 493.88, 554.37, 587.33, 659.25, 739.99, 830.61, 880.00];

const getClosestNoteFreq = freq => {
  let lastDist;

  return notes.reduce((acc, note) => {
    let dist = Math.abs(freq - note);

    if( null === acc ) {
      lastDist = dist;
      return note;
    }

    if( lastDist < dist ) {
      return acc;
    }

    lastDist = dist;
    return note;
  }, null);
};

const knobValueToFreq = value => {
  let rawFreq = freqMapping.map(value);
  return 'THRM' === mode ?
    rawFreq :
    getClosestNoteFreq(rawFreq);
}

const knobValueToVolume = value => {
  let ratio = 0.01;
  return value * ratio;
}

const powerSwitch = SwitchInput({
  element: document.querySelector('#switch-power'),
});

const typeSwitch = SwitchInput({
  element: document.querySelector('#switch-type'),
});

const possSwitch = SwitchInput({
  element: document.querySelector('#switch-poss'),
});

const light = Light({
  element: document.querySelector('#light'),
});

const volumeKnob = KnobInput({
  element: document.querySelector('#knob-volume'),
  initialValue: 40,
});

const freqKnob = KnobInput({
  element: document.querySelector('#knob-freq'),
  initialValue: 0,
});

powerSwitch.on('toggle', ev => {
  const value = ev.data;
  light.toggle(value);
  value ? play() : pause();
});

typeSwitch.on('toggle', ev => {
  const value = ev.data;
  mode = value ? 'MUS' : 'THRM';
});

possSwitch.on('toggle', ev => {
  let isOn = ev.data;
  if(isOn) {
    delayBuss.connect(gainNode);
    oscillatorDetuned.connect(gainNode);
  } else {
    delayBuss.disconnect(gainNode);
    oscillatorDetuned.disconnect(gainNode);
  }
});

volumeKnob.on('rotate', ({data}) => {
  gainNode.gain.linearRampToValueAtTime(knobValueToVolume(freqKnob.getValue(data)), audioCtx.currentTime + 0.1);
  delayBuss.gain.linearRampToValueAtTime(getDelayGain(knobValueToVolume(freqKnob.getValue(data))), audioCtx.currentTime + 0.1);
});

freqKnob.on('rotate', ({data}) => {
  const value = freqKnob.getValue(data);
  const freq = knobValueToFreq(value);
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime)
  oscillatorDetuned.frequency.setValueAtTime(freq, audioCtx.currentTime)
});
