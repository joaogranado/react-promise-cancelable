
# React Cancelable

> React Higher-Order Component to handle promise cancelation when the component unmounts.

React Cancelable is a Higher-Order Component that wraps handlers into new functions that return a [`Cancelable`](https://github.com/joaogranado/promise-cancelable), which are safely canceled when the component unmounts.

## Status

[![Travis](https://img.shields.io/travis/joaogranado/react-promise-cancelable.svg)](https://travis-ci.org/joaogranado/react-promise-cancelable)
[![Greenkeeper badge](https://badges.greenkeeper.io/joaogranado/react-promise-cancelable.svg)](https://greenkeeper.io/)

## Installation

```sh
npm install react-promise-cancelable promise-cancelable --save
```

```sh
yarn add react-promise-cancelable promise-cancelable
```

## API

### `cancelable()`

```js
cancelable(
  propsMapper: (ownerProps: Object) => Object
): HigherOrderComponent
```

Accepts a function that maps owner props to a new collection of props that are passed to the base component. The remapped props are wrapped functions around a new [`Cancelable`](https://github.com/joaogranado/promise-cancelable) that are safely canceled when the component unmounts.

**Note**: Every handlers that are not functions are therefore ignored.

## Usage

### Basic example
One of the use cases is to avoid calling `setState()` after a component has unmounted. The Higher-Order Component keeps a list of registered cancelables and calls the [`Cancelable.cancel()`](https://github.com/joaogranado/promise-cancelable#cancelableprototypecancel) method for each registered cancelable.

```js
// ./delay.js
import Cancelable from 'promise-cancelable';

export default delta =>
  new Cancelable((resolve, reject, onCancel) => {
    const id = setTimeout(() => {
      resolve(id);
    }, delta);

    onCancel(() => {
      clearTimeout(id);
    });
  });
```

```js
// ./my-component.js
import React, { Component } from 'react';
import delay from './delay';
import cancelable from 'react-promise-cancelable';

class MyComponent extends Component {
  state = { value: 'Not called' };

  updateValue = () => {
    // When the component unmounts the cancelable returned by `delay` is
    // canceled, so the `setState` method is not called.
    this.cancelable = this.props.delay(1000).then(() => {
      this.setState({ value: 'Called!' })
    });
  }

  cancel = () => {
    if (this.cancelable) {
      // Stop the progress of an ongoing asynchronous task.
      this.cancelable.cancel();
    }
  }

  render() {
    return (
      <div>
        <div>
          {this.state.value}
        </div>

        <button onClick={this.updateValue}>
          {'Click!'}
        </button>

        <button onClick={this.cancel}>
          {'Cancel!'}
        </button>
      </div>
    );
  }
}

export default cancelable(() => ({ delay }))(MyComponent);
```

### Canceling a HTTP request

Some HTTP clients provide a way to cancel requests. [axios](https://github.com/mzabriskie/axios) has a cancellation API using a cancel token.

We can create a new instance of `axios` and patch its methods in order to make them cancelable.

```js
//./axios.js
import Cancelable from 'promise-cancelable';
import axios from 'axios';

const makeCancelableRequest = method => (...args) => {
  return new Cancelable((resolve, reject, onCancel) => {
    const { CancelToken } = axios;
    // Create a cancellation token every time the method is called. This way we
    // avoid creating global tokens that could cancel all the subscribed requests.
    const source = CancelToken.source();

    // We create a new instance internally to avoid polluting the global
    // instance defaults.
    const instance = axios.create();

    instance.defaults.cancelToken = source.token;

    instance
      [method](...args)
      .then(result => {
        resolve(result);
      })
      .catch(reason => {
        // Check whether the reason is a cancellation notification.
        if (!axios.isCancel(reason)) {
          reject(reason);
        }
      });

    onCancel(() => {
      source.cancel();
    });
  });
};

const instance = axios.create();

// Example with `get`.
instance.get = makeCancelableRequest('get');

export default instance;
```

Now we can import our own `axios` instance and use it to create new requests that can be easily canceled whether when the user navigates to another page or by explicitly calling the `cancel()` method of that subscription.

```js
// ./app.js
import axios from './axios';

class App extends Component {
  state = { loading: false };

  getUsers = () => {
    if (this.cancelable) {
      // Cancel the previous request.
      this.cancelable.cancel();
    }

    // Show an initial loader.
    this.setState({ loading: true });

     // When the component unmounts this request will be canceled.
    this.cancelable = this.props.getUsers().then(() => {
      this.setState({ loading: false });
    }, () => {
      this.setState({ loading: false });
    });
  }

  render() {
    return (
      <div>
        {this.state.loading ? <Loader /> : null}

        <button onClick={this.getUsers}>{'Get users!'}</button>
      </div>
    );
  }
}

export default cancelable(() => ({
  getUsers: () => axios.get('/users')
}))(App);
```

## Related
[Cancelable](https://github.com/joaogranado/promise-cancelable)

## Licence

MIT © [João Granado](https://github.com/joaogranado)
