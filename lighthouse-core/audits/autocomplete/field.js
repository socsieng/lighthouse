/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Audit = require('../audit.js');
const i18n = require('../../lib/i18n/i18n.js');

const UIStrings = {
  /**
   * @description Title of a Lighthouse audit that provides detail on the useage of autocomplete for the field.
   * @example {cardnumber} field
   */
  title: 'Implements autocomplete for {field}',
  /**
   * @description Title of a Lighthouse audit that provides detail on the useage of autocomplete for the field when the audit fails.
   * @example {cardnumber} field
   */
  failureTitle: 'Does not implement autocomplete for {field}',
  /**
   * @description Description of a Lighthouse audit that tells the user *why* autocomplete is important.
   * @example {cardnumber} field
   */
  description: 'Form fields for {field} should include the autocomplete attribute.',
  /** Text description when no field is found. */
  noFormFields: 'Form field not present.',
  /**
   * @description Text description for field missing autocomplete attribute.
   * @example {cardnumber} name
   * @example {cc-number} autocomplete
   * */
  noAutocomplete: 'The field \'{name}\' is missing autocomplete attribute of \'{autocomplete}\'.',
};

const str_ = i18n.createMessageInstanceIdFn(__filename, UIStrings);

class AutocompleteField extends Audit {
  /**
   * @param {string} fieldName
   * @return {LH.Audit.Meta}
   */
  static getMeta(fieldName) {
    return {
      id: '',
      title: str_(UIStrings.title, {field: fieldName}),
      failureTitle: str_(UIStrings.failureTitle, {field: fieldName}),
      description: str_(UIStrings.description, {field: fieldName}),
      requiredArtifacts: ['FormFields'],
    };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @param {string} name
   * @param {string} autocomplete
   * @return {LH.Audit.Product}
   */
  static auditField(artifacts, name, autocomplete) {
    const formFields = artifacts.FormFields;
    const field = formFields.find(f => (f.name || '').toLowerCase() === name);
    let score = 0;
    /** @type {string|undefined} */
    let explanation = undefined;

    if (!field) {
      return {
        score: null,
        notApplicable: true,
        explanation: str_(UIStrings.noFormFields),
      };
    }

    if (!!field && field.autocomplete === autocomplete) {
      score = 1;
    } else {
      explanation = str_(UIStrings.noAutocomplete, {
        name,
        autocomplete,
      });
    }

    return {
      score,
      explanation,
    };
  }
}

module.exports = AutocompleteField;
module.exports.UIStrings = UIStrings;
