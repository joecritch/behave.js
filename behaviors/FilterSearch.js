window.FilterSearch = behave('FilterSearch', {
  handleKeyUp(evt) {
    this.props.onChange(this.getChild('input').value);
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
