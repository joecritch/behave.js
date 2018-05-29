const FilterControl = behave('FilterControl', {
  propTypes: {
    id: 'string',
  },
  handleFieldChange(value) {
    this.props.onChange(this.props.id, value);
  },
  render: {
    children: {
      field: {
        selected: _ => _.props.activeFilters[_.props.id] || null,
        onChange: _ => _.handleFieldChange,
      },
    },
  },
});

window.FilterControl = FilterControl;
