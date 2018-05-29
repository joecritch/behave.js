window.Overlay = behave('Overlay', {
  handleClick() {
    this.props.onRequestClose();
  },
  render: {
    attributes: {
      classList: {
        'is-open': _ => _.props.isOpen,
      },
    },
    listeners: {
      click: _ => _.props.isOpen && _.handleClick,
    },
  },
});
