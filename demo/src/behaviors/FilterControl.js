import { Behavior } from '@joecritch/behave.js';

class FilterControl extends Behavior {
  propTypes = {
    id: 'string',
  };
  render = {
    children: {
      field: {
        selected: _ => _.props.activeFilters[_.props.id] || null,
        onChange: _ => _.handleFieldChange,
      },
    },
  };
  handleFieldChange = value => {
    console.log("this.props", this.props);
    this.props.onChange(this.props.id, value);
  };
}

export default FilterControl;
