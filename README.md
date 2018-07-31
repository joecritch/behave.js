# behave.js

<img src="http://www.repostatus.org/badges/latest/wip.svg">

**Gradually layer a website's UI with JavaScript behavior, and keep it easy to understand and predict.**

Useful for websites that need a bit of JS [behavior](#why-behaviors). Less useful for applications where the UI changes intricately over time, where more functional components may be required (see React for that).

<img src="https://media.giphy.com/media/3o7bu1iM5MSwG2y7NS/giphy.gif">

## Contents

- [Installation](#installation)
- [How-To](#how-to)
  - [Initialize a behavior](#initialize-a-behavior)
  - [Render](#render)
  - [Change state](#change-state)
  - [Listen to events](#listen-to-events)
  - [Define children](#define-children)
  - [Connect a child to another behavior](#connect-a-child-to-another-behavior)
  - [Send data to a child](#send-data-to-a-child)
- [ES6 classes](#es6-classes)
  - [Class properties](#class-properties)
- [Another demo](#another-demo)
- [FAQ](#faq)

## Installation

- `npm install @joecritch/behave.js --save`

## How-To

- **[Here's a sandbox I made earlier](https://codesandbox.io/s/llk3oqno4l).**
- [And here's a more real-world demo](#another-demo)
- Follow along below to understand what's what. Or, if you're familiar with React etc., perhaps skip to [Send data to a child](#send-data-to-a-child) to compare.

**Knowledge required for this how-to:**

- HTML & JavaScript
- ES modules
- ES6 arrow functions

### Initialize a behavior

Firstly, we need to connect the HTML to JavaScript, in order to initialize the correct behavior.

```html
<!-- index.html -->

<!-- + the usual DOCTYPE, etc. -->
<button data-behavior="Toggle">
  Toggle me
</button>
```

```js
// src/Toggle.js

import { createBehavior } from '@joecritch/behave.js';

const Toggle = createBehavior('Toggle', {
  init() {
    console.log('Hello?');
  },
});

export default Toggle;
```

_(If you prefer, you can write behaviors as [ES6 classes](#es6-classes).)_

```js
// src/index.js

import { manageBehaviors } from '@joecritch/behave.js';
import Toggle from './Toggle'; // (The behavior you created before)

document.addEventListener('DOMContentLoaded', () => {
  manageBehaviors({
    Toggle,
  });
});
```

### Render

Each behavior supports a `render` property. This object can "describe", and therefore _affect_, the values of DOM attributes (in this case, the `style` attribute).

```js
const Toggle = createBehavior('Toggle', {
  render: {
    attributes: {
      style: {
        color: () => 'red',
      },
    },
  };
});
```

_^ Here, the button's text turns red immediately._

Each of the object's functions (e.g. `color`) is called whenever the behavior is updating. The values they return will be used with the respective DOM API operation. In this case: `node.style.color = "red";`.

Of course, the example above doesn't do anything that vanilla JS couldn't. (Or bog-standard HTML for that matter!) So let's dig into some features that might convince you...

### Change state

Behaviors can store their own state, which can be changed by various means.

```js
const Toggle = createBehavior('Toggle', {
  getInitialState() {
    return {
      isOn: false,
    };
  },

  init() {
    setTimeout(() => {
      this.setState({
        isOn: true,
      });
    }, 1000);
  },

  render: {
    attributes: {
      style: {
        color: _ => _.state.isOn ? 'red' : null,
      },
    },
  };
});
```

_^ The `isOn` state changes to `true` after 1 second. Therefore, the button's text turns red after 1 second._

Now, as promised, the `color` function serves a purpose! Rather than always returning "red", it now depends on the **state** of the component. If `isOn` is `true`, it'll be red; else, the color attribute will be removed (when it returns `null`).

(Note: the `_` argument of the function. This is the **behavior's instance that is currently being updated**. Of course, this can be called something else of course, if required. Also, if you want to avoid arrow functions and rely on `this` context instead, you can: `function() { console.log(this) }`, where `this` is the behavior instance.)

### Listen to events

Behaviors can also listen to native DOM events, using a similar declarative syntax.

```js
const Toggle = createBehavior('Toggle', {
  getInitialState() {
    return {
      isOn: false,
    };
  },

  handleClick() {
    this.setState({
      isOn: !this.state.isOn,
    });
  },

  render: {
    attributes: {
      style: {
        color: _ => _.state.isOn ? 'red' : null,
      },
    },
    listeners: {
      click: _ => _.handleClick,
    },
  },
});
```

_^ Here, when the button is clicked, its text turns red._

This is a convenient way to manage event listeners. Bonus: if the `click` function above returned `null`, it would remove any previous listener. (So, whether a listener is active could also be based on `_.state`.)

### Define children

You can describe child nodes for a behavior, using a `data-BehaviorName-childname` syntax:

```css
.hide { display: none; }
```

```html
<button data-behavior="Toggle">
  Turn me
  <span data-Toggle-ontext>on</span>
  <span data-Toggle-offtext class="hide">off</span>
</button>
```

```js
// ... rest of Toggle.js
  // render: {
    children: {
      'ontext': {
        attributes: {
          style: {
            display: _ => _.state.isOn ? 'none' : null,
          },
        },
      },
      'offtext': {
        attributes: {
          style: {
            display: _ => _.state.isOn ? null : 'none',
          },
        },
      },
    },
  // },
// ... rest of Toggle.js
```

This also works if you have multiple children of the same name.

### Connect a child to another behavior

A child can also reference another behavior via the markup:

```html
<div data-behavior="Panel" class="panel">
  <button data-Panel-btn="Toggle">
    <span data-Toggle-ontext>on</span>
    <span data-Toggle-offtext class="hide">off</span>
  </button>
</div>
```

We no longer reference `Toggle` from `data-behavior`, but instead define it as a child of the new `Panel` behavior.

Here is the new `Panel` behavior. No changes would be required to `Toggle` at this point.

(`Panel` will also need adding to `src.index.js` alongside `Toggle`)

```js
const Panel = createBehavior('Panel', {
  render: {
    children: {
      btn: {},
    },
  },
});
```

### Send data to a child

Behaviors can send data to their child behaviors using `props`.

Imagine the situation where `Panel` also needed to change its appearance when you click the toggle button. To do this, we'll move the `isOn` state to the `Panel` behavior instead. Then, we'll send `isOn` as a prop down to `Toggle`.

Furthermore, props support most common data types, including **functions**. By passing down functions, this allows the child to call it, like a callback. We'll use this pattern below, for the `click` event.

```js
const Panel = createBehavior('Panel', {
  getInitialState() {
    return {
      isOn: false,
    };
  },

  handleBtnClick() {
    this.setState({
      isOn: !this.state.isOn,
    });
  },

  render: {
    attributes: {
      classList: {
        'is-on': _ => _.state.isOn,
      },
    },
    children: {
      btn: {
        isOn: _ => _.state.isOn,
        onClick: _ => _.handleBtnClick,
      },
    },
  },
});
```

```css
.panel { background-color: #ccc; padding: 10px; }
.panel.is-on { background-color: yellow; }
```

```js
const Toggle = createBehavior('Toggle', {
  handleClick() {
    this.props.onClick();
  },

  render: {
    attributes: {
      style: {
        color: _ => _.props.isOn ? 'red' : null,
      },
    },
    listeners: {
      click: _ => _.handleClick,
    },
    children: {
      'ontext': {
        attributes: {
          style: {
            display: _ => _.props.isOn ? 'none' : null,
          },
        },
      },
      'offtext': {
        attributes: {
          style: {
            display: _ => _.props.isOn ? 'inline' : null,
          },
        },
      },
    },
  },
});
```

## ES6 Classes

There is also an ES6 class alternative for defining behaviors.

You access it like so:

```js
import { Behavior } from '@joecritch/behave.js';

export default class Toggle extends Behavior {
  constructor(...args) {
    super(...args);
    // Unlike when using `createBehavior()`, custom methods aren't auto-bound
    this.handleClick = this.handleClick.bind(this);

    this.state = {
      // (Or use getInitialState)
    };

    this.render = {
      // ... You render object
    };
  }

  // Your custom methods
  handleClick() {

  }
}

export default Toggle;
```

#### Class properties

Optionally, if you have `babel-preset-stage-2` or similar installed, you can use class properties too, for a terser syntax:

```js
import { Behavior } from '@joecritch/behave.js';

export default class Toggle extends Behavior {
  state = {
    // (Or use getInitialState)
  };

  // (`this` is properly bound, as its an arrow function)
  handleClick = () => {

  };

  render = {
    // ... You render object
  };
}

export default Toggle;
```

## Another demo

There is another demo which is slightly more "real world". It's located in the `demo` folder of this repo. Here's how to access it:

1. Clone this repo
1. `cd` into the project root
1. `$ yarn && yarn build` to compile `behave.js`
1. `$ cd demo && yarn && yarn demo`
1. `& open http://localhost:8081`

## FAQ

### How FAST is it?

_TBC!_

### Why "behaviors"?

This project doesn't use the term "component", because it doesn't take _full_ responsibility for its DOM structure.

More suitably, the term "behavior" comes from [AREA 17's concept](https://github.com/elementaljs/elementaljs) of referencing a function from a DOM attribute, which in itself originates from [elementaljs](https://github.com/elementaljs/elementaljs). You should check both those out too.

### How does it compare to React?

Unlike React or other functional UI libraries, the `render` property not a function. Instead, its an object, because its structure is not designed to change.

This also greatly reduces complexity in the internal "diff". However, the values within the object are functions, because they are designed to change, based on its input.

### Why are these FAQs so bad?

_Please contribute via issues or PRs! I'd like to make this as useful as possible._

## TODO

- [ ] Write tests
- [ ] Add Flow annotations
- [ ] Test overall performance
