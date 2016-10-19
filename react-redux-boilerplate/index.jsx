// Top level component of the data sharing overview table.
// Retrieves an app's view of the district's data through
// the app-view-service and displays it with a TabbedDataTable

import React from 'react';
import { render } from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';

import ExampleApp from './components/ExampleApp';
import store from './store';

export function run() {
  const el = document.getElementById('example-app-wrapper');
  render(
    <ReduxProvider store={store}>
      <ExampleApp />
    </ReduxProvider>
  , el);
}
