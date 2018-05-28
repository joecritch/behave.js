const behave = (name, obj) => {
  return function(node, initialProps) {
    const { render, getInitialState, ...custom } = obj;

    this.name = name;
    this.node = node;
    this.propTypes = this.propTypes || {};
    // this.prevRenderDesc = {};
    this.childCache = {};
    this.childrenCache = {};
    this.listenerCache = {};
    this.attributeCache = {};
    this.classListCache = {};

    this.__getAttrProps = () => {
      // Get DOM attribute props, using prop types
      const attrProps = {};
      const propKeys = Object.keys(this.propTypes);
      propKeys.forEach(propKey => {
        const propType = this.propTypes[propKey];
        const propValue = this.node.getAttribute(
          `data-${this.name}-${propKey}`
        );
        switch (propType) {
          case 'object': {
            attrProps[propKey] = JSON.parse(propValue);
            break;
          }
          default: {
            break;
          }
        }
      });
      return attrProps;
    };

    this.setState = updater => {
      const newState = updater(this.state);
      const stateKeys = Object.keys(newState);
      stateKeys.forEach(stateKey => {
        this.state[stateKey] = newState[stateKey];
      });
      this.__update();
    };

    this.__createChildInstance = (key, props) => {
      const attrKey = `data-${this.name}-${key}`;
      const el = this.node.querySelector(`[${attrKey}]`);
      const behaviorName = el.getAttribute(attrKey);
      const instance = new window[behaviorName](el, props);
      this.childCache[key] = instance;
    };

    // Called by parent behaviors
    this.setProps = props => {
      // Merge the DOM attribute props with explicit props
      this.props = Object.assign({}, this.attrProps, props);
      this.__update();
    };

    this.__update = () => {
      // console.trace();
      const renderDesc = render.apply(this);
      // const prevRenderDesc = this.prevRenderDesc;

      // Refresh render descriptions
      Object.keys(renderDesc.child || {}).forEach(childKey => {
        const childProps = renderDesc.child[childKey];
        // TODO -- consider removal of child ?
        if (this.childCache[childKey] == null) {
          this.__createChildInstance(childKey, childProps);
        } else {
          this.childCache[childKey].setProps(childProps);
        }
      });

      Object.keys(renderDesc.children || {}).forEach(key => {
        const childrenProps = renderDesc.children[key];

        // TODO -- consider removal of children ?
        if (this.childrenCache[key] == null) {
          const attrKey = `data-${this.name}-${key}`;
          const els = this.node.querySelectorAll(`[${attrKey}]`);
          this.childrenCache[key] = new Map();

          for (let i = 0; i < els.length; i++) {
            const behaviorName = els[i].getAttribute(attrKey);
            const resolvedProps = typeof childrenProps === 'function'
              ? childrenProps(els[i])
              : childrenProps;
            console.log("resolvedProps", resolvedProps);
            const instance = new window[behaviorName](
              els[i],
              resolvedProps
            );
            this.childrenCache[key].set(els[i], instance);
          }
        } else {
          const childrenMap = this.childrenCache[key];
          childrenMap.forEach((behavior, el) => {
            const resolvedProps = typeof childrenProps === 'function'
              ? childrenProps(el)
              : childrenProps;
            // console.log("resolvedProps", resolvedProps);
            behavior.setProps(
              resolvedProps
            );
          });
        }
      });

      Object.keys(renderDesc.listeners || {}).forEach(eventName => {
        const listener = renderDesc.listeners[eventName];
        if (this.listenerCache[eventName] != listener) {
          if (this.listenerCache[eventName]) {
            this.node.removeEventListener(
              eventName,
              this.listenerCache[eventName]
            );
          }
          if (typeof listener === 'function') {
            this.node.addEventListener(eventName, listener);
          }
          this.listenerCache[eventName] = listener;
        }
      });

      const attributeKeys = Object.keys(renderDesc.attributes || {}).forEach(
        attrKey => {
          const attr = renderDesc.attributes[attrKey];
          if (attrKey === 'classList') {
            const classes = Object.keys(attr).forEach(className => {
              const shouldHaveClass = attr[className];
              if (shouldHaveClass) {
                if (!this.classListCache[className]) {
                  this.node.classList.add(className);
                  this.classListCache[className] = true;
                }
              } else if (this.classListCache[className]) {
                this.node.classList.remove(className);
                delete this.classListCache[className];
              }
            });
          } else {
            if (attr != this.attributeCache[attrKey]) {
              this.node[attrKey] = attr;
              this.attributeCache[attrKey] = attr;
            }
          }
        }
      );

      this.renderDesc = renderDesc;
    };

    const customKeys = Object.keys(custom);
    customKeys.forEach(customKey => {
      const customMethod = custom[customKey];
      this[customKey] = customMethod.bind(this);
    });

    this.attrProps = this.__getAttrProps();
    this.props = Object.assign({}, this.attrProps, initialProps);
    this.state =
      typeof getInitialState === 'function' ? getInitialState.apply(this) : {};

    this.__update();
  };
};
