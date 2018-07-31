import { Behavior } from '@joecritch/behave.js';

class FilterSearch extends Behavior {
  handleKeyUp = (evt) => {
    this.props.onChange(this.getChild('input').value);
  }
  handleClearClick = () => {
    this.props.onChange('');
  }
  render = {
    children: {
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
  }
}

export default FilterSearch;
