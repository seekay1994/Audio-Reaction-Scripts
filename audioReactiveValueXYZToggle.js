'use strict';

/*
 * Adding new properties to the editor so you can tweak these values in the editor
 */
export var scriptProperties = createScriptProperties()
    .addSlider({
        name: 'frequencyMin',
        label: 'Frequency Min',
        value: 0,
        min: 0,
        max: 31,
        integer: true
    })
    .addSlider({
        name: 'frequencyMax',
        label: 'Frequency Max',
        value: 31,
        min: 0,
        max: 31,
        integer: true
    })
    .addSlider({
        name: 'smoothing',
        label: 'Smoothing',
        value: 16,
        min: 0,
        max: 32,
        integer: true
    })
    .addSlider({
        name: 'minvalue',
        label: 'Min Value',
        value: 0.8,
        min: 0,
        max: 3,
        integer: false
    })
    .addSlider({
        name: 'maxvalue',
        label: 'Max Value',
        value: 1.2,
        min: 0,
        max: 3,
        integer: false
    })
    .addSlider({
        name: 'minAudioBounds',
        label: 'Minimum Audio Bound',
        value: 0.0,
        min: 0.0,
        max: 1.0,
        integer: false
    })
    .addSlider({
        name: 'maxAudioBounds',
        label: 'Maximum Audio Bound',
        value: 1.0,
        min: 0.0,
        max: 1.0,
        integer: false
    })
    .addText({
        name: 'sharedValueName',
        label: 'Shared Value Name',
        value: 'sharedAudioValue'
    })
    .addCheckbox({
        name: 'applyToX',
        label: 'X',
        value: true
    })
    .addCheckbox({
        name: 'applyToY',
        label: 'Y',
        value: true
    })
    .addCheckbox({
        name: 'applyToZ',
        label: 'Z',
        value: true
    })
    .finish();

/**
 * This creates a permanent link to the audio response data.
 */
const audioBuffer = engine.registerAudioBuffers(engine.AUDIO_RESOLUTION_32);
let smoothValue = 0;
let initialValue;

/**
 * Initialize the initial value.
 */
export function init(value) {
    initialValue = (typeof value === 'number') ? value : value.x;
}

/**
 * Calculate new audio-scaled value.
 */
export function update(value) {
    const frequencyMin = Math.min(scriptProperties.frequencyMin, scriptProperties.frequencyMax);
    const frequencyMax = Math.max(scriptProperties.frequencyMin, scriptProperties.frequencyMax);
    const valueDelta = scriptProperties.maxvalue - scriptProperties.minvalue;

    // Average the audio buffer values within the frequency range
    let audioAverage = 0;
    for (let i = frequencyMin; i <= frequencyMax; i++) {
        audioAverage += audioBuffer.average[i];
    }
    audioAverage /= (frequencyMax - frequencyMin + 1);

    // Normalize the audio average within the min and max audio bounds
    const minAudioBounds = scriptProperties.minAudioBounds;
    const maxAudioBounds = scriptProperties.maxAudioBounds;
    let normalizedAudio = (audioAverage - minAudioBounds) / (maxAudioBounds - minAudioBounds);
    normalizedAudio = Math.max(0, Math.min(1, normalizedAudio)); // Clamp to [0, 1]

    const audioDelta = normalizedAudio - smoothValue;
    smoothValue += audioDelta * Math.min(1.0, engine.frametime * scriptProperties.smoothing);

    const result = smoothValue * valueDelta + scriptProperties.minvalue;

    // Share the updated value with a dynamic property name
    shared[scriptProperties.sharedValueName] = result;

    // Apply the result to the specified axes
    if (scriptProperties.applyToX) {
        value.x = result;
    }
    if (scriptProperties.applyToY) {
        value.y = result;
    }
    if (scriptProperties.applyToZ) {
        value.z = result;
    }

    return value;
}
