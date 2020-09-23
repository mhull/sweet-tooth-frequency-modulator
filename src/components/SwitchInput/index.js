import {getSettings} from './bootstrap';
import BaseComponent from '../BaseComponent';

export default SwitchInput;

function SwitchInput(settings) {
  let component;
  let _switch;
  let input;

  component = BaseComponent(getSettings(settings));
  _switch = component.element.querySelector('.switch.body');

  input = component.element.querySelector('input');

  component.toggle = value => {
    let hasTurnedOn = 'boolean' === typeof value ?
      _switch.classList.toggle('on', value) :
      _switch.classList.toggle('on');

    hasTurnedOn ?
      input.setAttribute('checked', 'checked') :
      input.removeAttribute('checked');

    component.emit('toggle', hasTurnedOn);
  };

  addEventListeners();

  if( component.propValues['isOn'] ) {
    component.toggle(true);
  }

  return component;

  function addEventListeners() {
    _switch.addEventListener('click', component.toggle);

    input.addEventListener('change', () => {
      input.checked ?
        component.toggle(true) :
        component.toggle(false);
    });
  }
};
