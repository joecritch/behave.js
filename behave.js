const behave = (name, obj) => {
  return function(node, initialProps) {
    const { init, onUpdate, propTypes = {}, render, getInitialState, ...custom } = obj;

    this.name = name;
    this.node = node;
    this.__cache = { attributes: {}, listeners: {}, children: {}, child: {} };

    this.__getAttrProps = () => {
      // Get DOM attribute props, using prop types
      const attrProps = {};
      const propKeys = Object.keys(propTypes);

      // console.log("this", this);
      // console.log('propTypes', propTypes)

      propKeys.forEach(propKey => {
        const propType = propTypes[propKey];
        const propValue = this.node.getAttribute(
          `data-${this.name}-${propKey}`
        );
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
    };

    this.getChild = (key) => {
      return this.__cache.child[key].node;
    };

    this.getChildren = (key) => {
      return this.__cache.children[key];
    };

    this.setState = updater => {
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
    };

    this.resolveProps = (props, args = []) => {
      // Resolve the prop functions
      const resolvedProps = {};
      Object.keys(props).forEach(propName => {
        resolvedProps[propName] = props[propName].call(null, this, ...args);
      });
      return resolvedProps;
    };

    // Called by parent behaviors
    this.setProps = (props, args = []) => {
      // Merge the DOM attribute props with explicit props
      const prevProps = this.props;
      this.props = Object.assign({}, this.attrProps, props);
      this.__update(prevProps, this.state);
    };

    this.__update = (prevProps = {}, prevState = {}) => {
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
          }
        });
      };

      const updateStyle = (node, styleObj, cache) => {
        Object.keys(styleObj).forEach(key => {
          let val = styleObj[key].call(null, this);

          // Uses `''` for null style values to properly remove
          val = val == null ? '' : val;
          if (val !== cache[key]) {
            node.style[key] = val;
            cache[key] = val;
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
          }
        });
      };

      const {
        children = {},
        child = {},
        attributes = {},
        listeners = {},
        ...props
      } = render;
      updateAttributes(node, attributes, this.__cache.attributes);
      updateListeners(node, listeners, this.__cache.listeners);

      Object.keys(child).forEach(childName => {
        const {
          attributes: childAttributes,
          listeners: childListeners,
          ...childProps
        } = child[childName];
        let el;

        // Set up the child
        if (!this.__cache.child[childName]) {
          const attrKey = `data-${this.name}-${childName}`;
          el = this.node.querySelector(`[${attrKey}]`);
          const behaviorName = el.getAttribute(attrKey);
          let instance;
          if (behaviorName) {
            // Currently supports only one linked behavior per child
            instance = new window[behaviorName](
              el,
              this.resolveProps(childProps, [el])
            );
          }
          this.__cache.child[childName] = {
            node: el,
            behavior: instance,
          };
        } else {
          el = this.__cache.child[childName].node;
          if (this.__cache.child[childName].behavior) {
            this.__cache.child[childName].behavior.setProps(this.resolveProps(childProps));
          }
        }

        if (childAttributes) {
          this.__cache.child[childName].attributes =
            this.__cache.child[childName].attributes || {};
          updateAttributes(
            this.__cache.child[childName].node,
            childAttributes,
            this.__cache.child[childName].attributes,
            [el]
          );
        }

        if (childListeners) {
          this.__cache.child[childName].listeners =
            this.__cache.child[childName].listeners || {};
          updateListeners(
            this.__cache.child[childName].node,
            childListeners,
            this.__cache.child[childName].listeners,
            [el]
          );
        }
      });

      Object.keys(children).forEach(childrenName => {
        const attrKey = `data-${this.name}-${childrenName}`;
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
          const resolvedProps =
            typeof children[childrenName] === 'function'
              ? children[childrenName](child)
              : children[childrenName];
          const {
            attributes: childAttributes,
            listeners: childListeners,
            ...childProps
          } = resolvedProps;

          if (!this.__cache.children[childrenName][i]) {
            const behaviorName = child.getAttribute(attrKey);
            let instance;
            if (behaviorName) {
              // Currently supports only one linked behavior per child
              instance = new window[behaviorName](
                child,
                this.resolveProps(childProps, [child])
              );
            }
            this.__cache.children[childrenName][i] = {
              node: child,
              behavior: instance,
            };
          } else {
            if (this.__cache.children[childrenName][i].behavior) {
              this.__cache.children[childrenName][i].behavior.setProps(
                this.resolveProps(childProps, [child])
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
      });

      if (onUpdate) {
        onUpdate.call(this, prevProps, prevState);
      }
    };

    const customKeys = Object.keys(custom);
    customKeys.forEach(customKey => {
      const customMethod = custom[customKey];
      this[customKey] = customMethod.bind(this);
    });

    this.attrProps = this.__getAttrProps();
    this.props = Object.assign({}, this.attrProps, initialProps);
    this.state =
      typeof getInitialState === 'function' ? getInitialState.call(this) : {};

    if (init) {
      init.call(this);
    }

    this.__update();
  };
};
