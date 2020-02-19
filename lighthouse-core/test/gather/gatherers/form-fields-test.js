/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* eslint-env jest */

const FormFields = require('../../../gather/gatherers/form-fields.js');

describe('Form Fields gatherer', () => {
  function getPassData({formFields = []}) {
    const url = 'https://example.com';
    const driver = {evaluateAsync: () => Promise.resolve(formFields)};
    const passContext = {driver, url};
    return [passContext];
  }

  it('returns elements from DOM', async () => {
    const formFields = [
      {
        id: 'ccname',
        name: 'ccname',
        elementType: 'input',
        inputType: 'text',
      },
      {
        id: 'cardnumber',
        name: 'cardnumber',
        elementType: 'input',
        inputType: 'text',
      },
      {
        id: 'cvc',
        name: 'cvc',
        elementType: 'input',
        inputType: 'text',
      },
      {
        id: 'cc-exp',
        name: 'cc-exp',
        elementType: 'input',
        inputType: 'text',
      },
    ];

    const result = await new FormFields().afterPass(...getPassData({formFields}));
    expect(result).toEqual([
      {
        id: 'ccname',
        name: 'ccname',
        elementType: 'input',
        inputType: 'text',
      },
      {
        id: 'cardnumber',
        name: 'cardnumber',
        elementType: 'input',
        inputType: 'text',
      },
      {
        id: 'cvc',
        name: 'cvc',
        elementType: 'input',
        inputType: 'text',
      },
      {
        id: 'cc-exp',
        name: 'cc-exp',
        elementType: 'input',
        inputType: 'text',
      },
    ]);
  });
});
