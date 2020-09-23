export default function(settings) {
  const component = initializeComponent(settings);

  addClassNames();
  setPropValues();
  renderTemplate();

  component.on = (eventType, callback) => component.element.addEventListener(eventType, callback);

  component.emit = (eventType, data) => {
    let e = new Event(eventType);
    e.data = data;
    component.element.dispatchEvent(e);
  }

  return component;

  function initializeComponent(settings) {
    let {id, element, template, classNames, props} = settings;

    id = id || element.id;
    element = element || document.createElement('div');
    classNames = [...classNames, 'component'];
    props = props || {};

    return {
      id,
      element,
      template,
      classNames,
      props,
      propValues: {},
    };
  }

  function addClassNames() {
    component.element.classList.add(...component.classNames);
  }

  function forEachProp(doCallback) {
    for(let name in component.props) {
      if(! component.props.hasOwnProperty(name)) {
        continue;
      }
      doCallback(name, component.props[name]);
    }
  }

  function setPropValues() {
    forEachProp(function(name, prop) {
      component.propValues[name] = getPropValue(name, prop);
    });
  }

  function getPropValue(name, prop) {
    return component.element.hasAttribute(name) ?
      getPropByElementAttribute(name, prop) :
      component.element.hasAttribute(`:${name}`) ?
        getDynamicPropByElementAttribute(name, prop) :
        prop.hasOwnProperty('default') ?
          getPropDefaultValue(name, prop) :
          null;
  }

  function getPropByElementAttribute(name, prop) {
    return getPropTypedValue(name, prop, component.element.getAttribute(name));
  }

  function getDynamicPropByElementAttribute(name, prop) {
    let value = component.element.getAttribute(`:${name}`);
    value = Function(`'use strict'; return ${value};`)();
    return getPropTypedValue(name, prop, value);
  }

  function getPropDefaultValue(name, prop) {
    return getPropTypedValue(name, prop, prop.default);
  }

  function getPropTypedValue(name, prop, value) {
    return prop.hasOwnProperty('type') && 'function' === typeof prop.type ?
      prop.type(value) :
      value;
  }

  function renderTemplate() {
    replaceTokens();
    removeAttributes();

    component.element.innerHTML = component.template;
  }

  function replaceTokens() {
    replaceToken('id', component.id);
    forEachProp(function(name) {
      replaceToken(name, component.propValues[name] || '');
    });
  }

  function replaceToken(tokenName, replacement ) {
    let tokenRegExp = getTokenRegExp(tokenName);
    component.template = component.template.replace(tokenRegExp, replacement);
  }

  function getTokenRegExp(tokenName) {
    return new RegExp(`{{\\s*${tokenName}\\s*}}`, 'gm');
  }

  function removeAttributes() {
    forEachProp(function(name) {
      component.element.removeAttribute(name);
    });
  }
}
