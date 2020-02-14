/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const Gatherer = require('./gatherer.js');
const getElementsInDocumentString = require('../../lib/page-functions.js').getElementsInDocumentString; // eslint-disable-line max-len

class MetaElements extends Gatherer {
  /**
   * @param {LH.Gatherer.PassContext} passContext
   * @return {Promise<LH.Artifacts['MetaElements']>}
   */
  async afterPass(passContext) {
    const driver = passContext.driver;

    // We'll use evaluateAsync because the `node.getAttribute` method doesn't actually normalize
    // the values like access from JavaScript does.
    return driver.evaluateAsync(`(() => {
      ${getElementsInDocumentString};

      return getElementsInDocument('head meta').map(meta => {
        var metaName;
        var metaContent;
        if (meta.httpEquiv) {
          metaName = meta.httpEquiv;
        } else if (meta.attributes[0].name == "charset") {
          metaName = meta.attributes[0].name;
          metaContent = meta.attributes[0].value;
        }
        return {
          name: metaName ? metaName.toLowerCase() : meta.name.toLowerCase(),
          content: metaContent ? metaContent : meta.content,
          property: meta.attributes.property ? meta.attributes.property.value : undefined,
        };
      });
    })()`, {useIsolation: true});
  }
}

module.exports = MetaElements;
