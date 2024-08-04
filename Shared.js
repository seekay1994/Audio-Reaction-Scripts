'use strict';

export var scriptProperties = createScriptProperties()
    .addText({
        name: 'sharedValueName',
        label: 'Shared Value Name',
        value: 'sharedValueName'
    })
    .finish();

export function update() {
    return shared[scriptProperties.sharedValueName];
}