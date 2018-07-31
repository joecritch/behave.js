import { createBehavior } from '@joecritch/behave.js';
import _ from 'lodash';
import produce from 'immer';

const FilterContainer = createBehavior('FilterContainer', {
  render: {
    children: {
      authgate: {
        isOpen: _ => _.state.authgateIsOpen,
        onRequestClose: _ => _.handleOverlayRequestClose,
      },
      resetlink: {
        attributes: {
          classList: {
            'is-disabled': _ => !_.isFiltered()
          },
        },
        listeners: {
          click: _ => _.reset,
        },
      },
      search: {
        value: _ => _.state.activeSearch,
        onChange: _ => _.handleSearchChange,
      },
      filtercontrol: {
        onChange: _ => _.changeById,
        activeFilters: _ => _.state.activeFilters,
      },
      results: {
        query: _ => _.serializeFilters(),
      },
    },
  },
  propTypes: {
    locked: 'boolean',
  },
  getInitialState() {
    return {
      activeFilters: {},
      activeSearch: '',
      authgateIsOpen: false,
    };
  },
  onUpdate() {
    console.log(this);
    console.log("this.state", this.state);
  },
  handleOverlayRequestClose() {
    this.setState({
      authgateIsOpen: false,
      activeSearch: '',
      activeFilters: {},
    })
  },
  handleSearchChange(value) {
    if (this.props.locked) {
      return this.setState({
        authgateIsOpen: true,
        activeSearch: '',
        activeFilters: {},
      });
    }

    this.setState({
      activeSearch: value,
    });
  },
  changeById(id, data) {
    if (this.props.locked) {
      return this.setState({
        authgateIsOpen: true,
        activeSearch: '',
        activeFilters: {},
      });
    }

    this.setState(produce(draft => {
      if (data == null) {
        delete draft.activeFilters[id];
      } else {
        draft.activeFilters[id] = data;
      }
    }));
  },
  reset(evt) {
    evt.preventDefault();
    this.setState({
      activeFilters: {},
      activeSearch: '',
    });
  },
  isFiltered() {
    return Object.keys(this.state.activeFilters).length || this.state.activeSearch;
  },
  serializeFilters() {
    const filters = this.state.activeFilters;
    let serializedFilters = {};
    const ids = Object.keys(filters);
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const filter = filters[id];
      if (Array.isArray(filter) && filter.length > 0) {
        serializedFilters[id] = filter.join('|');
      } else if (filter) {
        serializedFilters[id] = filter;
      }
    }

    if (this.state.activeSearch) {
      serializedFilters.search = this.state.activeSearch;
    }

    return serializedFilters;
  },
});

export default FilterContainer;
