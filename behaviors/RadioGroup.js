window.RadioGroup = behave('RadioGroup', {
  handleInputClick(child, evt) {
    evt.preventDefault();
    this.props.onChange(child.value || null);
  },
  render: {
    children: {
      input: {
        listeners: {
          click: (_, child) => _.handleInputClick.bind(null, child),
        },
        attributes: {
          checked: (_, child) => {
            console.log('checked', (child.value || null) === _.props.selected);
            // console.log("child.value", child.value);
            // console.log("_.props.selected", _.props.selected);
            return (child.value || null) === _.props.selected;
          },
        },
      },
    },
  },
});
