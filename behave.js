const behave = (name, obj) => {
  return function(node, initialProps) {
    const { render, getInitialState, ...custom } = obj;

    this.name = name;
    this.node = node;
    this.propTypes = this.propTypes || {};
    this.__cache = { attributes: {}, listeners: {}, children: {}, child: {} };

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
      let newState;
      if (typeof updater === 'function') {
        newState = updater(this.state);
      } else {
        newState = updater;
      }
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
      if (behaviorName) {
        const instance = new window[behaviorName](el, props);
        this.childCache[key] = {
          node: el,
          behavior: instance,
        };
      }
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

      const updateClassList = (node, classList, cache) => {
        Object.keys(classList).forEach(key => {
          const shouldHaveClass = classList[key];
          if (shouldHaveClass !== cache[key]) {
            if (shouldHaveClass) {
              node.classList.add(key);
            } else {
              node.classList.remove(key);
            }
          }
        });
      };

      const updateAttributes = (node, attrs, cache) => {
        const { classList, ...rest } = attrs;
        if (classList) {
          cache.classList = cache.classList || {};
          updateClassList(node, classList, cache.classList);
        }

        Object.keys(rest).forEach(key => {
          const attr = rest[key];
          if (attr !== cache[key]) {
            // TODO -- some attributes might have a different api
            node[key] = attr;
          }
        });
      };

      const updateListeners = (node, listeners, cache) => {
        Object.keys(listeners).forEach(key => {
          const listener = listeners[key];
          if (listener !== cache[key]) {
            if (cache[key]) {
              node.removeEventListener(key, cache[key]);
            }
            if (listener) {
              node.addEventListener(key, listener);
            }
          }
        });
      };

      const { children = {}, child = {}, attributes = {}, listeners = {}, ...props } = renderDesc;
      updateAttributes(node, attributes, this.__cache.attributes);
      updateListeners(node, listeners, this.__cache.listeners);

      Object.keys(child).forEach(childName => {
        const {
          attributes: childAttributes,
          listeners: childListeners,
          ...childProps
        } = child[childName];
        // Set up the child
        if (!this.__cache.child[childName]) {
          const attrKey = `data-${this.name}-${childName}`;
          const el = this.node.querySelector(`[${attrKey}]`);
          const behaviorName = el.getAttribute(attrKey);
          let instance;
          if (behaviorName) {
            // Currently supports only one linked behavior per child
            instance = new window[behaviorName](el, childProps);
          }
          this.__cache.child[childName] = {
            node: el,
            behavior: instance,
          };
        } else {
          if (this.__cache.child[childName].behavior) {
            this.__cache.child[childName].behavior.setProps(childProps);
          }
        }

        if (childAttributes) {
          this.__cache.child[childName].attributes =
            this.__cache.child[childName].attributes || {};
          updateAttributes(
            this.__cache.child[childName].node,
            childAttributes,
            this.__cache.child[childName].attributes
          );
        }

        if (childListeners) {
          this.__cache.child[childName].listeners =
            this.__cache.child[childName].listeners || {};
          updateListeners(
            this.__cache.child[childName].node,
            childListeners,
            this.__cache.child[childName].listeners
          );
        }
      });

      Object.keys(children).forEach(childrenName => {
        const attrKey = `data-${this.name}-${childrenName}`;
        let childList;

        // TODO -- we may need a mechanism to update children
        if (!this.__cache.children[childrenName]) {
          this.__cache.children[childrenName] = {
            __nodeList: this.node.querySelectorAll(`[${attrKey}]`)
          };
        }

        const nodeList = this.__cache.children[childrenName].__nodeList;

        for (let i = 0; i < nodeList.length; i++) {
          const child = nodeList[i];
          const resolvedProps = typeof children[childrenName] === 'function' ? children[childrenName](child) : children[childrenName];
          const { attributes: childAttributes, listeners: childListeners, ...childProps} = resolvedProps;

          if (!this.__cache.children[childrenName][i]) {
            const behaviorName = child.getAttribute(attrKey);
            let instance;
            if (behaviorName) {
              // Currently supports only one linked behavior per child
              instance = new window[behaviorName](child, childProps);
            }
            this.__cache.children[childrenName][i] = {
              node: child,
              behavior: instance,
            };
          } else {
            if (this.__cache.children[childrenName][i].behavior) {
              this.__cache.children[childrenName][i].behavior.setProps(childProps);
            }
          }

          if (childAttributes) {
            this.__cache.children[childrenName][i].attributes =
              this.__cache.children[childrenName][i].attributes || {};
            updateAttributes(
              this.__cache.children[childrenName][i].node,
              childAttributes,
              this.__cache.children[childrenName][i].attributes
            );
          }

          if (childListeners) {
            this.__cache.children[childrenName][i].listeners =
              this.__cache.children[childrenName][i].listeners || {};
            updateListeners(
              this.__cache.children[childrenName][i].node,
              childListeners,
              this.__cache.children[childrenName][i].listeners
            );
          }
        }
      });
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
