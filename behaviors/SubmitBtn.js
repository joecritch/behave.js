const SubmitBtn = behave('SubmitBtn', {
  render: {
    attributes: {
      disabled: _ => _.props.isDisabled,
      classList: {
        'is-disabled': _ => _.props.isDisabled,
      },
    },
    listeners: {
      click: _ => _.props.onClick,
    },
  },
});

window.SubmitBtn = SubmitBtn;
