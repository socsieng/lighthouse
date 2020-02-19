/**
 * @license Copyright 2016 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Audit = require('../audit.js');
const AutocompleteField = require('./field.js');
const i18n = require('../../lib/i18n/i18n.js');

const UIStrings = {
  /** Text description when year field is missing. */
  noYear: 'No year field found.',
  /** Text description when month field is missing. */
  noMonth: 'No month field found.',
  /**
   * @description Text description for expiration field with missing autocomplete attribute.
   * @example {cardnumber} name
   * @example {cc-number} autocomplete
   * */
  noAutocomplete: 'The expiration field \'{name}\' is missing autocomplete attribute of' +
    ' \'{autocomplete}\'.',
};

const str_ = i18n.createMessageInstanceIdFn(__filename, UIStrings);

class AutocompleteCardName extends Audit {
  /**
   * @return {LH.Audit.Meta}
   */
  static get meta() {
    return {
      ...AutocompleteField.getMeta('expiration date'),
      id: 'expiration',
    };
  }

  /**
   * @param {LH.Artifacts} artifacts
   * @return {LH.Audit.Product}
   */
  static audit(artifacts) {
    const formFields = artifacts.FormFields;
    const date = formFields.find(f => (f.name || '').toLowerCase() === 'exp-date');
    const month = formFields.find(f => (f.name || '').toLowerCase() === 'ccmonth');
    const year = formFields.find(f => (f.name || '').toLowerCase() === 'ccyear');

    let score = 0;
    /** @type {string|undefined} */
    let explanation = undefined;

    if (date && date.autocomplete === 'cc-exp') {
      score = 1;
    } else if (month && month.autocomplete === 'cc-exp-month'
      && year && year.autocomplete === 'cc-exp-year') {
      score = 1;
    } else if (year && month && month.autocomplete === 'cc-exp-month') {
      score = 0.5;
      // @ts-ignore
      explanation = str_(UIStrings.noAutocomplete, {
        name: year.name,
        autocomplete: 'cc-exp-year',
      });
    } else if (month && year && year.autocomplete === 'cc-exp-year') {
      score = 0;
      // @ts-ignore
      explanation = str_(UIStrings.noAutocomplete, {
        name: month.name,
        autocomplete: 'cc-exp-month',
      });
    } else if (date) {
      score = 0;
      // @ts-ignore
      explanation = str_(UIStrings.noAutocomplete, {
        name: date.name,
        autocomplete: 'cc-exp',
      });
    } else if (month && !year) {
      score = 0;
      explanation = str_(UIStrings.noYear);
    } else if (year && !month) {
      score = 0;
      explanation = str_(UIStrings.noMonth);
    } else {
      return {
        score: null,
        notApplicable: true,
      };
    }

    return {
      score,
      explanation,
    };
  }
}

module.exports = AutocompleteCardName;
module.exports.UIStrings = UIStrings;
