
# React Promise Cancelable
> React Higher-Order Component to handle promise cancelation when the component unmounts.

React Promise Cancelable is a Higher-Order Component that wraps handlers into new functions that return a [`Cancelable`](https://github.com/joaogranado/promise-cancelable), which are safely canceled when the component unmounts.

## Status

[![Travis](https://img.shields.io/travis/joaogranado/react-promise-cancelable.svg?style=flat-square)](https://travis-ci.org/joaogranado/react-promise-cancelable)

## Installation

```sh
npm install react-promise-cancelable --save
```

```sh
yarn add react-promise-cancelable
```

## API

### `cancelable()`

```js
cancelable(
  propsMapper: (ownerProps: Object) => Object
): HigherOrderComponent
```

Accepts a function that maps owner props to a new collection of props that are passed to the base component. The remapped props are wrapped functions around a new [`Cancelable`](https://github.com/joaogranado/promise-cancelable) that are safely canceled when the component unmounts.

*Note*: All handlers that are not functions are ignored.

## Usage

### Basic example
We want to be able of stopping the progress of an ongoing asynchronous task.

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
// ./component.js
import React from 'react';
import delay from './delay';
import cancelable from 'react-promise-cancelable';

class Component extends React.Component {
  sayHello = () => {
    this.cancelable = this.props.sayHello();
  }

  cancel = () => {
    if (this.cancelable) {
      this.cancelable.cancel();
    }
  }

  render() {
    return (
      <div>
        <div>
          {this.state.value}
        </div>

        <button onClick={this.sayHello}>
          {'Click!'}
        </button>

        <button onClick={this.cancel}>
          {'Cancel!'}
        </button>
      </div>
    );
  }
}

export default cancelable(() => ({
  sayHello: () =>
    delay(1000).then(() => {
      console.log('Hello!');
    })
}))(Component);
```

### Avoid calling setState after a Component has unmounted
One of the use cases is to avoid calling `setState()` after a component has unmounted. The Higher-Order Component keeps a list of registered cancelables and calls the [`Cancelable.cancel()`](https://github.com/joaogranado/promise-cancelable#cancelableprototypecancel) method for each registered cancelable.

```js
// ./child-component.js
import React from 'react';
import cancelable from 'react-promise-cancelable';

const ChildComponent = props => (
  <button onClick={this.updateValue}>
    {'Click!'}
  </button>
);

export default cancelable(props => ({ delay }))(ChildComponent);
```

```js
// ./parent-component.js
import ChildComponent from './child-component';
import React from 'react';

export default class ParentComponent extends React.Component {
  state = { value: null, show: true };

  hideChild = () => {
    this.setState(() => ({ show: false }));
  };

  updateValue = () => {
    // When the component unmounts the cancelable returned by `delay` is
    // canceled, so the `setState` method is not called.
    this.props.delay(1000).then(() => {
      this.setState(() => ({ value: 'foo' }));
    });
  };

  render() {
    return (
      <div>
        <div>
          {this.state.value}
        </div>

        {this.state.show ? <ChildComponent /> : null}

        <button onClick={this.hideChild}>
          {'Hide!'}
        </button>
      </div>
    );
  }
}
```

## Licence

MIT © [João Granado](https://github.com/joaogranado)
