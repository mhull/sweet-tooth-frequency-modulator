import {getSettings} from './bootstrap';
import BaseComponent from "../BaseComponent";

export default function(settings) {
  const component = BaseComponent(getSettings(settings));

  const light = component.element.querySelector('.light.body');

  component.toggle = value => {
    let hasTurnedOn = 'boolean' === typeof value ?
      light.classList.toggle('on', value) :
      light.classList.toggle('on');

    component.emit('toggle', hasTurnedOn);
  }

  if( component.propValues['isOn'] ) {
    component.toggle(true);
  }

  return component;
}
