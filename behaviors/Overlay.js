window.Overlay = behave('Overlay', {
  handleClick() {
    this.props.onRequestClose();
  },
  render: {
    attributes: {
      // classList: {
        // 'is-open': _ => _.props.isOpen,
      // },
      style: {
        display: _ => _.props.isOpen ? null : 'none',
      },
    },
    listeners: {
      click: _ => _.props.isOpen && _.handleClick,
    },
  },
});
