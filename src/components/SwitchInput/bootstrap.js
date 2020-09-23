import template from "./template.html";
import './style.scss';

export {getSettings};

function getSettings(settings) {
  return {
    ...settings,
    classNames: [...(settings.classNames || []), 'switch-input'],
    template,
    props: {
      label: {
        type: String,
        default: '',
      },
      isOn: {
        type: Boolean,
        default: false,
      },
    },
  }
};
