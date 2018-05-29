document.addEventListener('DOMContentLoaded', () => {
  // This would normally be managed separately.
  // window.joinForm = new JoinForm(
  //   document.querySelector('[data-behavior="JoinForm"')
  // );
  window.filterContainer = new FilterContainer(
     document.querySelector('[data-behavior="FilterContainer"')
  );
});
