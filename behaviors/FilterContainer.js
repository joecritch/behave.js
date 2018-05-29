const FilterContainer = behave('FilterContainer', {
  getInitialState() {
    return {
      activeFilters: {},
      activeSearch: '',
    };
  },
  onUpdate() {
    console.log("this.state", this.state);
  },
  handleSearchChange(value) {
    this.setState({
      activeSearch: value,
    });
  },
  changeById(id, data) {
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
  render: {
    child: {
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
    },
    children: {
      filtercontrol: {
        onChange: _ => _.changeById,
        activeFilters: _ => _.state.activeFilters,
      },
    },
  },
});

window.FilterContainer = FilterContainer;
