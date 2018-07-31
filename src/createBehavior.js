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
        return init.apply(this, args);
      }
    }

    getInitialState(...args) {
      if (getInitialState) {
        return getInitialState.apply(this, args);
      }
    }

    onUpdate(...args) {
      if (onUpdate) {
        return onUpdate.apply(this, args);
      }
    }
  }

  Object.defineProperty(ExtendedBehavior, 'name', { value: name });

  return ExtendedBehavior;
};

export default createBehavior;
