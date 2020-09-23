import SwitchInput from './src/components/SwitchInput';
import Light from './src/components/Light';
import KnobInput from './src/components/KnobInput';

import './main.scss';
import LinearMap1d from "./src/models/LinearMap1d";
import Interval1d from "./src/models/Interval1d";

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const gainNode = audioCtx.createGain();

gainNode.connect(audioCtx.destination);

let oscillator;

const play = () => {
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

  oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.connect(gainNode);
  oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
  oscillator.start();

  gainNode.gain.linearRampToValueAtTime(knobValueToVolume(volumeKnob.getValue()), audioCtx.currentTime);
};

const pause = () => {
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
  oscillator.stop(audioCtx.currentTime + 1);
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

volumeKnob.on('rotate', ({data}) => {
  gainNode.gain.linearRampToValueAtTime(knobValueToVolume(freqKnob.getValue(data)), audioCtx.currentTime + 0.1);
});

freqKnob.on('rotate', ({data}) => {
  const value = freqKnob.getValue(data);
  const freq = knobValueToFreq(value);
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime)
});
