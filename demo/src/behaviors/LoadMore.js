import { Behavior } from 'behave.js';
import shallowEqualObjects from 'shallow-equal/objects';
import { debounce } from 'lodash';

class LoadMore extends Behavior {
  init() {
    this.fetchResults = debounce(this.fetchResults, 500);
    this.fetchResults();
  }
  getInitialState() {
    return {
      currentPage: 1,
      isLastPage: this.props.lastPage || false,
    };
  }
  onUpdate(prevProps, prevState) {
    if (!shallowEqualObjects(this.props.query, prevProps.query || {})) {
      this.setState({
        currentPage: 1,
      });
    }

    if (this.state.currentPage !== prevState.currentPage) {
      this.fetchResults();
    }
  }
  handleBtnClick = () => {
    this.setState({
      currentPage: this.state.currentPage + 1,
    });
  }
  fetchResults() {
    const headers = new Headers();
    headers.set('Accept', 'application/json');

    const responsePromise = fetch(`/mock_json/results_page_${this.state.currentPage}.json`, {
      method: 'GET',
      headers,
    });

    responsePromise.then(res => res.json()).then(json => {
      this.setState({
        isLastPage: Boolean(json.lastPage),
      });

      // heavy DOM writes not supported by behave.js,
      // so it escape hatches to imperative
      if (this.state.currentPage > 1) {
        const template = document.createElement('template');
        template.innerHTML = json.html;
        this.getChild('inner').node.appendChild(template.content);
      } else {
        this.getChild('inner').node.innerHTML = json.html;
      }
    });
  }
  render = {
    children: {
      inner: {},
      btn: {
        listeners: {
          click: _ => _.handleBtnClick,
        },
        attributes: {
          style: {
            display: _ => _.state.isLastPage ? 'none' : null,
          },
        },
      },
    },
  }
}

export default LoadMore;
