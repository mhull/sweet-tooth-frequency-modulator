import template from './template.html';
import './style.scss';

export {getSettings};

function getSettings(settings) {
  let {element, classNames} = settings;

  classNames = [...(classNames || []), 'light'];

  return {
    template,
    element,
    classNames,
    props: {
      isOn: {
        type: Boolean,
        default: false,
      },
    },
  };
}
