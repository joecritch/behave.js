const FilterContainer = behave('FilterContainer', {
  getInitialState() {
    return {
      activeFilters: {},
      activeSearch: '',
      authgateIsOpen: false,
    };
  },
  onUpdate() {
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
  render: {
    child: {
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
    },
    children: {
      filtercontrol: {
        onChange: _ => _.changeById,
        activeFilters: _ => _.state.activeFilters,
      },
    },
  },
  propTypes: {
    locked: 'boolean',
  },
});

window.FilterContainer = FilterContainer;
