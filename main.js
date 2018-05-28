function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {
  window.joinForm = new JoinForm(document.querySelector('[data-behavior="JoinForm"'));
  // const textInputEls = document.querySelectorAll('[data-behavior="TextInput"');
  // window.textInputs = [];
  // for (let i = 0; i < textInputEls.length; i++) {
    // window.textInputEls.push(new TextInput(textInputEls[i]));
  // }
  // window.submitBtn = new SubmitBtn(document.querySelector('[data-behavior="SubmitBtn"'));

  // joinForm.setProps({});

});
