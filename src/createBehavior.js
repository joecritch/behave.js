import Behavior from './Behavior';

const createBehavior = (name, obj) => {
  const {
    init,
    onUpdate,
    propTypes = {},
    render = {},
    getInitialState,
    ...custom
  } = obj;

  class ExtendedBehavior extends Behavior {
    render = render;

    constructor(...args) {
      super(...args);
      const customKeys = Object.keys(custom);
      customKeys.forEach(customKey => {
        const customMethod = custom[customKey];
        this[customKey] = customMethod.bind(this);
      });
    }

    init(...args) {
      if (init) {
        init(...args);
      }
    }

    getInitialState(...args) {
      if (getInitialState) {
        getInitialState(...args);
      }
    }

    onUpdate(...args) {
      if (onUpdate) {
        onUpdate(...args);
      }
    }
  }

  Object.defineProperty(ExtendedBehavior, 'name', { value: name });

  return ExtendedBehavior;
};

export default createBehavior;
