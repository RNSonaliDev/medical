/**
 * @format
 */

import * as ReactNative from 'react-native';

// React Native 0.85+ Bridgeless mode compatibility shim for legacy NativeModules
try {
  if (!ReactNative.NativeModules) {
    Object.defineProperty(ReactNative, 'NativeModules', {
      value: {},
      writable: true,
      configurable: true,
    });
  }
} catch (e) {
  console.warn('Failed to define ReactNative.NativeModules shim:', e);
}

if (typeof global.NativeModules === 'undefined') {
  global.NativeModules = {};
}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
