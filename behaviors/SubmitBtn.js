const SubmitBtn = behave('SubmitBtn', {
  render() {
    return {
      attributes: {
        disabled: this.props.isDisabled,
        classList: {
          'is-disabled': this.props.isDisabled,
        },
      },
      listeners: {
        click: this.props.onClick,
      },
    };
  },
});

window.SubmitBtn = SubmitBtn;
