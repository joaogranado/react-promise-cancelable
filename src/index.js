/**
 * Module dependencies.
 */

import Cancelable from 'promise-cancelable';
import isPlainObject from 'lodash/isPlainObject';
import React, { Component } from 'react';

/**
 * Export `cancelable`.
 */

export default (mapProps = () => ({})) => WrappedComponent => {
  class WithCancelable extends Component {
    cancelables = null;
    cached = null;

    mapProps = () => {
      if (this.cached) {
        return this.cached;
      }

      const mappedProps = mapProps(this.props);

      if (
        process.env.NODE_ENV !== 'production' &&
        !isPlainObject(mappedProps)
      ) {
        throw new TypeError(
          `The returning value of the mapProps should be a plain object. Received ${typeof mappedProps} instead.`
        );
      }

      this.cached = Object.entries(
        mapProps(this.props)
      ).reduce((result, [key, fn]) => {
        if (typeof fn !== 'function') {
          return result;
        }

        result[key] = (...args) => {
          const cancelable = Cancelable.resolve(fn(...args));

          if (!this.cancelables) {
            this.cancelables = [cancelable];
          } else {
            this.cancelables.push(cancelable);
          }

          return cancelable;
        };

        return result;
      }, {});

      return this.cached;
    };

    componentWillUnmount() {
      if (!this.cancelables) {
        return;
      }

      this.cancelables.forEach(cancelable => {
        cancelable.cancel();
      });

      this.cancelables = null;
      this.cached = null;
    }

    render() {
      const props = {
        ...this.props,
        ...this.mapProps()
      };

      return React.createElement(WrappedComponent, props);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const wrappedComponentDisplayName =
      WrappedComponent.displayName || WrappedComponent.name || 'Component';

    WithCancelable.displayName = `cancelable(${wrappedComponentDisplayName})`;
  }

  return WithCancelable;
};
