import React from 'react';
import { mount } from 'enzyme';
import TranslationProvider from '@src/stores/TranslationContext';

describe('ApplicationLogic', function () {
  it('should render without crashing', function () {
    const component = mount(
      <TranslationProvider>
      </TranslationProvider>
    );
    component.unmount();
  });
});
