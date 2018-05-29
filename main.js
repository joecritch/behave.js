document.addEventListener('DOMContentLoaded', () => {
  // This would normally be managed separately.
  // window.joinForm = new JoinForm(
  //   document.querySelector('[data-behavior="JoinForm"')
  // );

  const filterContainerEl = document.querySelector(
    '[data-behavior="FilterContainer"]'
  );

  window.filterContainer = new FilterContainer(filterContainerEl);

  let inDom = true;
  const observer = new MutationObserver(mutations => {
    if (document.body.contains(filterContainerEl)) {
      if (!inDom) {
        console.log('element inserted');
      }
      inDom = true;
    } else if (inDom) {
      inDom = false;
      console.log('element removed');
    }
  });
  
  observer.observe(document.body, { childList: true });
});
