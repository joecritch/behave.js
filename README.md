# behave.js!

A **truly work-in-progress** JS lib that's as easy to reason-about as a React app, but focuses on simpler DOM attribute modifications, rather than entire DOM tree manipulation.

Useful for website behaviors; less so for complex apps.

[!oh behave](https://media.giphy.com/media/3o7bu1iM5MSwG2y7NS/giphy.gif)

```html
<div data-behavior="SomeBehavior">
  Hello.
  <button data-SomeBehavior-btn="Button">
    Click me
  </button>
</div>
```

```js
// Here's an \extremely useful\ demo behavior that disables itself when you click a child Button behavior

const SomeBehavior = behave('SomeBehavior', {
  init() {
    // You can do debounce binding here, etc.
  },
  handleBtnClick() {
    // (auto-binded "this" methods)

    // also supports an updater function, because i like immer's API
    this.setState({
      isDisabled: true,
    });
  }
  onUpdate() {
    // Side-effects here
    // (e.g. some DOM manipulation that isn't supported in render)
  },
  // Render is *purposefully* an static object, rather than a function
  // Because behave.js doesn't concern itself with template-like DOM manipulation. This allows the diffing algorithm to be much simpler and lighter.
  render: {
    attributes: {
      style: {
        // All leaf values in render should be a **function**.
        // The functions will always be run on render,
        // and if there output is different, the DOM will be changed

        // Return null to remove an inline style...
        color: _ => _.state.isDisabled ? 'red' : null,
      },
    },
    // The "child" namespace is very single-element children
    child: {
      // This is the name of the child, e.g. `data-SomeBehavior-btn`
      btn: {
        // Custom props can be passed down to child behaviors
        isDisabled: _ => _.state.isDisabled,
        onClick: _ => _.handleBtnClick,
      }
    },
    // The "children" namespace is used for multi-element children
    // children: {
    //   item: {
    //     attributes: {
    //       classList: {
    //         'is-active': (_, item) => {
    //           // you get access to the particular child with "item" if you need it
    //         }
    //       },
    //     },
    //   }
    // },
  }
});

const Button = behave('Button', {
  render: {
    attributes: {
      disabled: _ => _.state.isDisabled,
      // (`_` instead of `this` for arrow fn support)
      classList: {
        // Class list property is handled by toggling the class list
        'is-disabled': _ => _.state.isDisabled,
      },
    },
    // Listeners for native DOM events
    // will automatically by removed if you return `null` in the function
    listeners: {
      click: _ => _.props.onClick,
    },
  }
});
```
