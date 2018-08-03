import Behavior from './Behavior';
import { JSDOM } from 'jsdom';

let { document } = new JSDOM(`
  <div data-behavior="MyBehavior"></div>
`).window;

let node = document.querySelector('[data-behavior]');

jest.useFakeTimers();

describe('Behavior.initialize', () => {
  test('extends Behavior', () => {
    class MyBehavior extends Behavior { }
    expect(MyBehavior.initialize(node, {
      MyBehavior,
    })).toBeInstanceOf(Behavior);
  });

  test('sets initial state', () => {
    class MyBehavior extends Behavior {
      state = {
        myState: true,
      };
    }
    expect(MyBehavior.initialize(node, {
      MyBehavior,
    }).state.myState).toBe(true);
  });

  test('sets prop from attr as string', () => {
    document = new JSDOM(`
      <div data-behavior="MyBehavior" data-MyBehavior-foo="bar"></div>
    `).window.document;

    node = document.querySelector('[data-behavior]');

    class MyBehavior extends Behavior {
      propTypes = {
        foo: 'string',
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    expect(inst.props.foo).toBe('bar');
  });

  test('sets prop from attr as boolean', () => {
    document = new JSDOM(`
      <div data-behavior="MyBehavior" data-MyBehavior-foo></div>
    `).window.document;

    node = document.querySelector('[data-behavior]');

    class MyBehavior extends Behavior {
      propTypes = {
        foo: 'boolean',
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    expect(inst.props.foo).toBe(true);
  });

  test('sets prop from attr as object', () => {
    document = new JSDOM(`
      <div data-behavior="MyBehavior" data-MyBehavior-foo='{"mars": "bar"}'></div>
    `).window.document;

    node = document.querySelector('[data-behavior]');

    class MyBehavior extends Behavior {
      propTypes = {
        foo: 'object',
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    expect(inst.props.foo).toEqual({
      mars: 'bar',
    });
  });

  test('calls init() callback', () => {
    const mockInit = jest.fn();
    class MyBehavior extends Behavior {
      init() {
        mockInit();
      }
      state = {
        myState: true,
      };
    }
    MyBehavior.initialize(node, {
      MyBehavior,
    });
    expect(mockInit).toHaveBeenCalled();
  });
});

describe('getChild', () => {
  test('returns child node as .node', () => {
    document = new JSDOM(`
      <div data-behavior="MyBehavior"></div>
    `).window.document;

    node = document.querySelector('[data-behavior]');
    const child = document.createElement('div');
    child.setAttribute('data-MyBehavior-mychild', '');
    node.appendChild(child);

    class MyBehavior extends Behavior {
      render = {
        children: {
          mychild: {},
        },
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    expect(inst.getChild('mychild').node).toBe(child);
    expect(inst.getChild('mychild').behavior).toBe(undefined);
  });

  it('returns child behavior as .behavior', () => {
    document = new JSDOM(`
      <div data-behavior="MyBehavior"><div data-MyBehavior-mychild="MyChildBehavior"></div></div>
    `).window.document;

    node = document.querySelector('[data-behavior]');

    class MyBehavior extends Behavior {
      render = {
        children: {
          mychild: {},
        },
      };
    }

    class MyChildBehavior extends Behavior { }

    const loadedBehaviors = {
      MyBehavior,
      MyChildBehavior,
    };

    const inst = MyBehavior.initialize(node, loadedBehaviors);

    expect(inst.getChild('mychild').behavior).toBeInstanceOf(MyChildBehavior);
  });
});

describe('getChildren', () => {
  it('returns an array of children', () => {
    document = new JSDOM(`
      <div data-behavior="MyBehavior">
        <div data-MyBehavior-mychild></div>
        <div data-MyBehavior-mychild></div>
      </div>
    `).window.document;

    node = document.querySelector('[data-behavior]');

    const children = node.querySelectorAll('[data-MyBehavior-mychild]');
    const child = children[0];
    const child2 = children[1];

    class MyBehavior extends Behavior {
      render = {
        children: {
          mychild: {},
        },
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    expect(inst.getChildren('mychild')[0].node).toBe(child);
    expect(inst.getChildren('mychild')[1].node).toBe(child2);
  });
});

describe('setState', () => {
  it('updates state after setTimeout', () => {
    class MyBehavior extends Behavior {
      state = {
        isOn: false,
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    expect(inst.state.isOn).toBe(false);

    inst.setState({
      isOn: true,
    });

    jest.runOnlyPendingTimers();

    expect(inst.state.isOn).toBe(true);
  });

  it('updates state with an updater fn', () => {
    class MyBehavior extends Behavior {
      state = {
        isOn: false,
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    inst.setState(() => ({
      isOn: true,
    }));

    jest.runOnlyPendingTimers();

    expect(inst.state.isOn).toBe(true);
  });
});

describe('onUpdate', () => {
  it('calls onUpdate when updating', () => {
    const mockOnUpdate = jest.fn();

    class MyBehavior extends Behavior {
      onUpdate() {
        mockOnUpdate();
      }
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    inst.setState(() => ({
      foo: 'bar',
    }));
    jest.runOnlyPendingTimers();

    expect(mockOnUpdate.mock.calls.length).toBe(1);
  });
});

describe('render base node', () => {

  it('updates classList', () => {
    class MyBehavior extends Behavior {
      state = {
        isOn: false,
      };
      render = {
        attributes: {
          classList: {
            'is-on': _ => _.state.isOn,
          },
        }
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    expect(node.classList.contains('is-on')).toBe(false);

    inst.setState({
      isOn: true,
    });
    jest.runOnlyPendingTimers();

    expect(node.classList.contains('is-on')).toBe(true);

    // For test coverage
    // TODO -- check if we can test for not touching DOM
    inst.setState({
      isOn: true,
    });
    jest.runOnlyPendingTimers()
    expect(node.classList.contains('is-on')).toBe(true);

  });

  it('updates style', () => {
    let { document } = new JSDOM(`
      <div data-behavior="MyBehavior" style="color: green"></div>
    `).window;

    let node = document.querySelector('[data-behavior]');

    class MyBehavior extends Behavior {
      state = {
        isOn: false,
      };
      render = {
        attributes: {
          style: {
            color: _ => {
              switch (_.state.isOn) {
                case true:
                  return 'red';
                case false:
                  return 'blue';
                default:
                  return null;
              }
            },
          },
        }
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    expect(node.style.color).toBe('blue');

    inst.setState({
      isOn: true,
    });
    jest.runOnlyPendingTimers();

    expect(node.style.color).toBe('red');

    // For test coverage
    // TODO - check to see we didn't touch the DOM?
    inst.setState({
      isOn: true,
    });
    jest.runOnlyPendingTimers();
    expect(node.style.color).toBe('red');
    ///////////////////////////////

    inst.setState({
      isOn: null, // change the style to "null"
    });
    jest.runOnlyPendingTimers();

    expect(node.style.color).toBe(''); // default
  });

  it('listens to events', () => {
    const mockClickHandler = jest.fn();
    const mockClickHandler2 = jest.fn();

    const handleClick = (evt) => {
      evt.preventDefault();
      mockClickHandler();
    };

    const handleClick2 = (evt) => {
      evt.preventDefault();
      mockClickHandler2();
    };

    class MyBehavior extends Behavior {
      state = {
        mode: 0,
      };
      render = {
        listeners: {
          click:  _ => {
            switch (_.state.mode) {
              case 1:
                return handleClick;
              case 2:
                return handleClick2;
              default:
                return null;
            }
          },
        },
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    node.click();

    expect(mockClickHandler.mock.calls.length).toBe(0);

    inst.setState({
      mode: 1,
    });
    jest.runOnlyPendingTimers();

    node.click();

    expect(mockClickHandler.mock.calls.length).toBe(1);

    inst.setState({
      mode: 2,
    });
    jest.runOnlyPendingTimers();

    node.click();

    expect(mockClickHandler.mock.calls.length).toBe(1);
    expect(mockClickHandler2.mock.calls.length).toBe(1);

    inst.setState({
      mode: 0,
    });
    jest.runOnlyPendingTimers();

    node.click();

    expect(mockClickHandler.mock.calls.length).toBe(1);

  });
});

describe('render children', () => {
  it('updates child attribute', () => {
    document = new JSDOM(`
      <div data-behavior="MyBehavior">
        <button data-MyBehavior-mychild>Click</button>
      </div>
    `).window.document;
    node = document.querySelector('[data-behavior]');
    const child = node.querySelector('[data-MyBehavior-mychild]');

    class MyBehavior extends Behavior {
      state = {
        isDisabled: true,
      };
      render = {
        children: {
          mychild: {
            attributes: {
              disabled: _ => _.state.isDisabled,
            },
          },
        },
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    expect(child.disabled).toBe(true);

    inst.setState({
      isDisabled: false,
    });
    jest.runOnlyPendingTimers();

    expect(child.disabled).toBe(false);


    // Here to test running the same state
    // TODO -- investigate checking whether the DOM was touched
    inst.setState({
      isDisabled: false,
    });
    jest.runOnlyPendingTimers();
    expect(child.disabled).toBe(false);

  });

  it('passes props down to child behavior', () => {
    document = new JSDOM(`
      <div data-behavior="MyBehavior">
        <a href="#" data-MyBehavior-mychild="MyChildBehavior"></a>
      </div>
    `).window.document;

    node = document.querySelector('[data-behavior]');
    const child = node.querySelector('[data-MyBehavior-mychild]');

    class MyBehavior extends Behavior {
      render = {
        children: {
          mychild: {
            foo: _ => 'bar',
          },
        },
      };
    }

    class MyChildBehavior extends Behavior { }

    const loadedBehaviors = {
      MyBehavior,
      MyChildBehavior,
    };

    const inst = MyBehavior.initialize(node, loadedBehaviors);
    const childBehavior = inst.__cache.children.mychild[0].behavior;

    // Adds coverage for using the cached version
    // TODO -- investigate testing for the cache?
    inst.setState({
      justATestUpdate: true,
    });
    jest.runOnlyPendingTimers();
    expect(childBehavior.props.foo).toBe('bar');
  });

  it('listens to child event', () => {
    const mockClickHandler = jest.fn();

    const handleClick = (evt) => {
      evt.preventDefault();
      mockClickHandler();
    };

    document = new JSDOM(`
      <div data-behavior="MyBehavior">
        <a href="#" data-MyBehavior-mychild></a>
      </div>
    `).window.document;

    node = document.querySelector('[data-behavior]');
    const child = node.querySelector('[data-MyBehavior-mychild]');

    class MyBehavior extends Behavior {
      state = {
        isOn: false,
      };
      render = {
        children: {
          mychild: {
            listeners: {
              click:  _ => (_.state.isOn ? handleClick : null),
            },
          },
        }
      };
    }

    const inst = MyBehavior.initialize(node, {
      MyBehavior,
    });

    child.click();

    expect(mockClickHandler.mock.calls.length).toBe(0);

    inst.setState({
      isOn: true,
    });
    jest.runOnlyPendingTimers();

    child.click();

    expect(mockClickHandler.mock.calls.length).toBe(1);

    // Running to cover tests
    // TODO - check to see if we can check if the event is not re-listened to?
    inst.setState({
      isOn: true,
    });
    jest.runOnlyPendingTimers();
    ////////////////////////////

    inst.setState({
      isOn: false,
    });
    jest.runOnlyPendingTimers();

    child.click();

    expect(mockClickHandler.mock.calls.length).toBe(1);

  });
});
