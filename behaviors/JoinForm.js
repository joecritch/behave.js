const JoinForm = behave('JoinForm', {
  // child: ['submitbtn'],
  // children: ['textinput'],
  getInitialState() {
    return {
      invalidFields: [], // TODO - serialize as nodes:: this.options.invalidfields ||
      errorMode: false,
    };
  },
  handleTextinputValid(node) {
    this.setState(produce(draft => {
      draft.invalidFields.splice(draft.invalidFields.indexOf(node), 1);
    }));
  },
  handleTextinputInvalid(node) {
    this.setState(produce(draft => {
      draft.invalidFields.push(node);
    }));
  },
  handleSubmitBtnClick() {
    this.setState({
      errorMode: true,
    });
  },
  render() {
    // console.log("this.state.invalidFields.length > 0", this.state.invalidFields.length > 0);
    // console.log("this.state", this.state);

    return {
      child: {
        submitbtn: {
          isDisabled: this.state.invalidFields.length > 0,
          onClick: this.handleSubmitBtnClick,
        },
      },
      children: {
        textinput: (child) => ({
          onValid: this.handleTextinputValid,
          onInvalid: this.handleTextinputInvalid,
          isValid: this.state.invalidFields.indexOf(child) === -1,
        }),
      },
    };
  },
});

window.JoinForm = JoinForm;
