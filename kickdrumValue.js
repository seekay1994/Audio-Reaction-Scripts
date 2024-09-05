'use strict';

export var scriptProperties = createScriptProperties()
    .addSlider({
        name: 'threshold',
        label: 'Minimum Bass Threshold',
        value: 0.9,
        min: 0,
        max: 1,
        integer: false
    })
    .addSlider({
        name: 'fadeSpeed',
        label: 'Fade Speed',
        value: 1.75,
        min: 0.1,
        max: 2,
        integer: false
    })
    .addSlider({
        name: 'sensitivity',
        label: 'Bass Sensitivity',
        value: 20,
        min: 1,
        max: 50,
        integer: false
    })
    .finish();

const audioBuffer = engine.registerAudioBuffers(engine.AUDIO_RESOLUTION_16);
let bassValue = 0;
let isFading = false;

export function update(value) {
    let bassLevel = audioBuffer.average[0];

    if (!isFading && bassLevel > scriptProperties.threshold) {
        bassValue += bassLevel * scriptProperties.sensitivity * engine.frametime;
        if (bassValue >= 1) {
            bassValue = 1;
            isFading = true;
        }
    } else if (isFading) {
        bassValue -= engine.frametime * scriptProperties.fadeSpeed;
        if (bassValue <= 0) {
            bassValue = 0;
            isFading = false;
        }
    }

    return bassValue;
}

export function init(value) {
    return value;
}
