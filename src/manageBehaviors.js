function manageBehaviors(loadedBehaviorsModule, dataAttr = 'behavior') {

  // Normalize any non-iterated modules as an object
  const loadedBehaviorNames = Object.keys(loadedBehaviorsModule);
  const loadedBehaviors = {};
  loadedBehaviorNames.forEach(name => {
    loadedBehaviors[name] = loadedBehaviorsModule[name];
  });

  const activeBehaviors = new Map();

  createBehaviors(document);
  observeBehaviors();

  function loopBehaviors(node, cb) {
    if (!('querySelectorAll' in node)) {
      // Ignore text or comment nodes
      return;
    }
    const behaviorNodes = node.querySelectorAll(`[data-${dataAttr}]`);
    for (let i = 0; i < behaviorNodes.length; i++) {
      const behaviorNode = behaviorNodes[i];
      const behaviorNames = behaviorNode.dataset[dataAttr].split(' ');
      behaviorNames.forEach(name => {
        cb(name, behaviorNode);
      });
    }
  }

  function destroyBehaviors(node) {
    loopBehaviors(
      node,
      (bName, bNode) => {
        const nodeBehaviors = activeBehaviors.get(bNode);
        if (!nodeBehaviors || !nodeBehaviors[bName]) {
          console.warn(`No behavior ${bName} instance on:`, bNode);
          return;
        }
        if (nodeBehaviors[bName].willUnmount) {
          nodeBehaviors[bName].willUnmount();
        }
        delete nodeBehaviors[bName];
      }
    );
  }

  function createBehaviors(node) {
    loopBehaviors(node, (bName, bNode) => {
      if (!loadedBehaviors[bName]) {
        console.warn(`No loaded behavior called ${bName}`);
        return;
      }

      const instance = loadedBehaviors[bName].initialize(bNode, loadedBehaviors);
      const nodeBehaviors = activeBehaviors.get(bNode) || {};
      nodeBehaviors[bName] = instance;
      activeBehaviors.set(bNode, nodeBehaviors);
    });
  }

  function observeBehaviors() {
    var observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.removedNodes) {
          for (var i = 0; i < mutation.removedNodes.length; i++) {
            var node = mutation.removedNodes[i];
            destroyBehaviors(node);
          }
        }
      });

      mutations.forEach(mutation => {
        if (mutation.addedNodes) {
          for (var i = 0; i < mutation.addedNodes.length; i++) {
            var node = mutation.addedNodes[i];
            createBehaviors(node);
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });
  }
}

export default manageBehaviors;
