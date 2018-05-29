const JoinForm = behave('JoinForm', {
  getInitialState() {
    return {
      invalidFields: [], // TODO - serialize as nodes? this.options.invalidfields ||
      errorMode: false,
    };
  },
  onUpdate() {
    // console.log('this', this.props, this.state);
  },
  handleTextinputValid(node) {
    this.setState(
      produce(draft => {
        draft.invalidFields.splice(draft.invalidFields.indexOf(node), 1);
      })
    );
  },
  handleTextinputInvalid(node) {
    this.setState(
      produce(draft => {
        draft.invalidFields.push(node);
      })
    );
  },
  handleSubmitBtnClick() {
    this.setState({
      errorMode: true,
    });
  },
  render: {
    child: {
      submitbtn: {
        isDisabled: (_, child) => _.state.invalidFields.length > 0,
        onClick: _ => _.handleSubmitBtnClick,
      },
    },
    children: {
      textinput: {
        onValid: _ => _.handleTextinputValid,
        onInvalid: _ => _.handleTextinputInvalid,
        isValid: (_, child) => _.state.invalidFields.indexOf(child) === -1,
      },
    },
  },
});

window.JoinForm = JoinForm;
