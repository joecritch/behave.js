window.FilterSearch = behave('FilterSearch', {
  init() {
    this.handleKeyUp = debounce(this.handleKeyUp, 500);
  },
  handleKeyUp(evt) {
    this.props.onChange(this.getChild('input').node.value);
  },
  handleClearClick() {
    this.props.onChange('');
  },
  render: {
    child: {
      input: {
        attributes: {
          value: _ => _.props.value,
        },
        listeners: {
          keyup: _ => _.handleKeyUp,
        },
      },
      clear: {
        listeners: {
          click: _ => _.handleClearClick,
        },
        attributes: {
          classList: {
            'is-disabled': _ => !Boolean(_.props.value)
          },
        },
      },
    },
  },
});
