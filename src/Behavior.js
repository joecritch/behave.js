class Behavior {
  propTypes = {};
  render = {};
  __cache = { attributes: {}, listeners: {}, children: {}, child: {} };
  static initialize(node, loadedBehaviors, initialProps) {
    const instance = new this(arguments);
    instance.node = node;
    instance.attrProps = instance.__getAttrProps();
    instance.props = Object.assign({}, instance.attrProps, initialProps);
    instance.loadedBehaviors = loadedBehaviors;
    instance.state = instance.state || {};
    instance.__update(undefined, undefined, true);
    if (instance.init) {
      instance.init();
    }
    return instance;
  }
  __getAttrProps() {
    const propTypes = this.propTypes;

    // Get DOM attribute props, using prop types
    const attrProps = {};
    const propKeys = Object.keys(propTypes);

    propKeys.forEach(propKey => {
      const propType = this.propTypes[propKey];
      const propValue = this.node.getAttribute(`data-${this.constructor.name}-${propKey}`);
      switch (propType) {
        case 'object': {
          attrProps[propKey] = JSON.parse(propValue);
          break;
        }
        case 'boolean': {
          attrProps[propKey] = propValue != null;
          break;
        }
        default: {
          attrProps[propKey] = propValue;
          break;
        }
      }
    });
    return attrProps;
  }

  getChild(key) {
    return this.__cache.children[key] && this.__cache.children[key][0];
  }

  getChildren(key) {
    return this.__cache.children[key];
  }

  setState(updater) {
    let newState;
    if (typeof updater === 'function') {
      newState = updater(this.state);
    } else {
      newState = updater;
    }
    const prevState = Object.assign({}, this.state);
    const stateKeys = Object.keys(newState);
    stateKeys.forEach(stateKey => {
      this.state[stateKey] = newState[stateKey];
    });
    // setTimeout is used to affect the DOM reliably
    // e.g. currentTarget.checked
    setTimeout(() => {
      this.__update(this.props, prevState);
    }, 0);
  }

  __resolveProps(props, args) {
    // Resolve the prop functions
    const resolvedProps = {};
    Object.keys(props).forEach(propName => {
      resolvedProps[propName] = props[propName].call(null, this, ...args);
    });
    return resolvedProps;
  }

  // Called by parent behaviors
  __setProps(props, args = []) {
    // Merge the DOM attribute props with explicit props
    const prevProps = this.props;
    this.props = Object.assign({}, this.attrProps, props);
    this.__update(prevProps, this.state);
  }

  __update(prevProps = {}, prevState = {}, silentUpdate = false) {

    // console.group('__update', this.node);

    const updateClassList = (node, classList, cache) => {
      Object.keys(classList).forEach(key => {
        const shouldHaveClass = classList[key].call(null, this);
        if (shouldHaveClass !== cache[key]) {
          if (shouldHaveClass) {
            node.classList.add(key);
          } else {
            node.classList.remove(key);
          }
          cache[key] = shouldHaveClass;
          // console.log('updated class', cache[key]);
        }
      });
    };

    const updateStyle = (node, styleObj, cache) => {
      Object.keys(styleObj).forEach(key => {
        let val = styleObj[key].call(null, this);

        // Uses `''` for null style values to properly remove
        val = val == null ? '' : val;
        if (val !== cache[key]) {
          if (key.startsWith('--')) {
            // it's a css variable
            node.style.setProperty(key, val);
          } else {
            node.style[key] = val;
          }
          cache[key] = val;
          // console.log('updated style property', cache[key]);
        }
      });
    };

    const updateAttributes = (node, attrs, cache, args = []) => {
      const { classList, style, ...rest } = attrs;

      if (classList) {
        cache.classList = cache.classList || {};
        updateClassList(node, classList, cache.classList);
      }

      if (style) {
        cache.style = cache.style || {};
        updateStyle(node, style, cache.style);
      }

      Object.keys(rest).forEach(key => {
        const attr = rest[key].call(null, this, ...args);
        if (attr !== cache[key]) {
          // TODO -- some attributes might have a different api
          node[key] = attr;
          cache[key] = attr;

          // console.log("updated misc. attribute", cache[key]);
        }
      });
    };

    const updateListeners = (node, listeners, cache, args = []) => {
      Object.keys(listeners).forEach(key => {
        const listener = listeners[key].call(null, this, ...args);
        if (listener !== cache[key]) {
          if (cache[key]) {
            node.removeEventListener(key, cache[key]);
          }
          if (listener) {
            node.addEventListener(key, listener);
          }
          cache[key] = listener;
          // console.log("updated listener", cache[key]);
        }
      });
    };

    const {
      children = {},
      attributes = {},
      listeners = {},
      ...props
    } = this.render;
    updateAttributes(this.node, attributes, this.__cache.attributes);
    updateListeners(this.node, listeners, this.__cache.listeners);

    // console.log("children", children);

    Object.keys(children).forEach(childrenName => {

      // console.group(childrenName);

      const attrKey = `data-${this.constructor.name.toLowerCase()}-${childrenName}`;
      let childList;

      // TODO -- we may need a mechanism to update children
      if (!this.__cache.children[childrenName]) {
        this.__cache.children[childrenName] = {
          __nodeList: this.node.querySelectorAll(`[${attrKey}]`),
        };
      }

      const nodeList = this.__cache.children[childrenName].__nodeList;

      for (let i = 0; i < nodeList.length; i++) {
        const child = nodeList[i];
        const {
          attributes: childAttributes,
          listeners: childListeners,
          ...childProps
        } = children[childrenName];

        if (!this.__cache.children[childrenName][i]) {
          const behaviorName = child.getAttribute(attrKey);
          let instance;
          if (behaviorName) {
            // TODO - Currently supports only one linked behavior per child
            instance = this.loadedBehaviors[behaviorName].initialize(
              child,
              this.loadedBehaviors,
              this.__resolveProps(childProps, [child])
            );
          }
          this.__cache.children[childrenName][i] = {
            node: child,
            behavior: instance,
          };
        } else {
          if (this.__cache.children[childrenName][i].behavior) {
            this.__cache.children[childrenName][i].behavior.__setProps(
              this.__resolveProps(childProps, [child])
            );
          }
        }

        if (childAttributes) {
          this.__cache.children[childrenName][i].attributes =
            this.__cache.children[childrenName][i].attributes || {};
          updateAttributes(
            this.__cache.children[childrenName][i].node,
            childAttributes,
            this.__cache.children[childrenName][i].attributes,
            [child]
          );
        }

        if (childListeners) {
          this.__cache.children[childrenName][i].listeners =
            this.__cache.children[childrenName][i].listeners || {};
          updateListeners(
            this.__cache.children[childrenName][i].node,
            childListeners,
            this.__cache.children[childrenName][i].listeners,
            [child]
          );
        }
      }

      // console.groupEnd();
    });

    if (this.onUpdate && !silentUpdate) {
      this.onUpdate.call(this, prevProps, prevState);
    }

    // console.groupEnd();
  }
}

export default Behavior;
