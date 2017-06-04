/**
 * Module dependencies.
 */

import { mount } from 'enzyme';
import React, { Component } from 'react';
import cancelable from '../src';

describe('cancelable', () => {
  it('sets the display name according to the component displayName', () => {
    const component = () => {};
    component.displayName = 'foo';

    expect(cancelable()(component).displayName).toBe('cancelable(foo)');
  });

  it('sets the display name according to the default function name', () => {
    const foo = () => null;

    expect(cancelable()(foo).displayName).toBe('cancelable(foo)');
  });

  it('sets the display name to be `Component`', () => {
    expect(cancelable()(() => null).displayName).toBe('cancelable(Component)');
  });

  it('passes the component props to the props mapper', () => {
    const WithCancelable = cancelable(props => {
      expect(props).toEqual({ foo: 'bar' });

      return {};
    })(() => null);

    mount(<WithCancelable foo={'bar'} />);
  });

  it('keeps the properties if no prop mapper is passed', () => {
    const component = jest.fn(() => null);
    const WithCancelable = cancelable()(component);

    mount(<WithCancelable foo={'bar'} />);

    expect(component.mock.calls[0][0]).toHaveProperty('foo', 'bar');
  });

  it('throws an error if the value returned from the props mapper is not a plain object', () => {
    const component = jest.fn(() => null);
    const WithCancelable = cancelable(() => '')(component);

    expect(() => mount(<WithCancelable foo={'bar'} />)).toThrow(
      'The returning value of the mapProps should be a plain object. Received string instead.'
    );
  });

  it('ignores properties on the prop mapper that are not functions', () => {
    const component = jest.fn(() => null);
    const WithCancelable = cancelable(() => ({
      foo: 'bar'
    }))(component);

    mount(<WithCancelable />);

    expect(component.mock.calls[0][0]).not.toHaveProperty('foo');
  });

  it('deregisters the wrapped cancelables', () => {
    let foo;
    const promise = Promise.resolve();
    const component = props => {
      foo = props.foo();

      return null;
    };
    const WithCancelable = cancelable(() => ({
      foo: () => promise
    }))(component);
    const { node } = mount(<WithCancelable />);

    expect(Array.isArray(node.cancelables)).toBe(true);
    expect(node.cancelables.length).toBe(1);
    expect(node.cancelables[0] === foo);
    expect(node.cached).toHaveProperty('foo');

    node.componentWillUnmount();

    expect(foo.isCanceled()).toBe(true);
    expect(node.cancelables).toBeNull();
    expect(node.cached).toBeNull();
  });
});
