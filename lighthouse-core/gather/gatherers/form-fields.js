/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Gatherer = require('./gatherer.js');
const {getElementsInDocumentString, getNodePathString} = require('../../lib/page-functions.js');

/**
 * @fileoverview
 * This gatherer collects all the form field elements including `input`, `select`,
 * and `textarea`.
 */

/**
 * @return {LH.Artifacts['FormFields']}
 */
/* istanbul ignore next */
function getFormFields() {
  const ignoredInputs = [
    'hidden',
    'button',
    'submit',
    'checkbox',
    'radio',
  ];

  /** @type {Array<HTMLInputElement>} */
  // @ts-ignore - getElementsInDocument put into scope via stringification
  const inputElements = getElementsInDocument('input, select, textarea'); // eslint-disable-line no-undef
  /** @type {LH.Artifacts['FormFields']} */
  const formFields = inputElements
    .filter(element => element.nodeName.toLowerCase() !== 'input'
      || (element.nodeName.toLowerCase() === 'input'
          && !ignoredInputs.some(type => element.type === type)))
    .map(element => {
      const form = element.closest('form');
      let formPath;

      if (form) {
        // @ts-ignore - getNodePath put into scope via stringification
        formPath = getNodePath(form); // eslint-disable-line no-undef
      }

      return {
        id: element.id,
        name: element.name,
        elementType: element.nodeName.toLowerCase(),
        inputType: element.type,
        autocomplete: element.autocomplete,
        placeholder: element.placeholder,
        formPath,
      };
    });

  return formFields;
}

class FormFields extends Gatherer {
  /**
   * @param {LH.Gatherer.PassContext} passContext
   * @return {Promise<LH.Artifacts['FormFields']>}
   */
  static getFormFields(passContext) {
    return passContext.driver.evaluateAsync(`(() => {
      ${getElementsInDocumentString};
      ${getNodePathString};
      ${getFormFields};

      return getFormFields();
    })()`, {useIsolation: true});
  }

  /**
   * @param {LH.Gatherer.PassContext} passContext
   * @return {Promise<LH.Artifacts['FormFields']>}
   */
  async afterPass(passContext) {
    const formFields = await FormFields.getFormFields(passContext);

    return formFields;
  }
}

module.exports = FormFields;
