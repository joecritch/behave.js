const validateInput = (node, config) => {
  return node.value;
};

const TextInput = behave('TextInput', {
  handleBlur() {
    if (validateInput(this.node, this.props.validateconfig)) {
      if (!this.props.isValid) {
        this.props.onValid(this.node);
      }
    } else if (this.props.isValid) {
      this.props.onInvalid(this.node);
    }
  },
  handleKeyUp(evt) {
    if (keycode(evt) === 'enter') {
      // Emulate a form submission
      this.props.onRequestSubmit();
      return;
    }
  },
  render: {
    attributes: {
      classList: {
        'is-error': _ => !_.props.isValid,
      },
    },
    listeners: {
      blur: _ => _.handleBlur,
    },
  },
});

TextInput.propTypes = {
  validateconfig: 'object',
};

window.TextInput = TextInput;
