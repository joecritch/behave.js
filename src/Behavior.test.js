import Behavior from './Behavior';
import { JSDOM } from 'jsdom';

let { document } = new JSDOM(`
  <div data-behavior="MyBehavior"></div>
`).window;

let node = document.querySelector('[data-behavior]');

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
    jest.useFakeTimers();

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
    jest.useFakeTimers();

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
