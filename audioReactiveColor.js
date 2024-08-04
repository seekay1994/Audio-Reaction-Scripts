'use strict';

import * as WEColor from 'WEColor';

// Adding new properties to the editor so you can tweak these values in the editor
export var scriptProperties = createScriptProperties()
    .addColor({
        name: 'minColor',
        label: 'Minimum Color',
        value: new Vec3(0, 0, 0) // Default to black
    })
    .addColor({
        name: 'maxColor',
        label: 'Maximum Color',
        value: new Vec3(1, 1, 1) // Default to white
    })
    .addSlider({
        name: 'minFrequency',
        label: 'Minimum Frequency',
        value: 0,
        min: 0,
        max: 31,
        integer: true
    })
    .addSlider({
        name: 'maxFrequency',
        label: 'Maximum Frequency',
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
        value: 'sharedColor'
    })
    .finish();

// This creates a permanent link to the audio response data.
const audioBuffer = engine.registerAudioBuffers(engine.AUDIO_RESOLUTION_32);
let smoothValue = 0;

export function update(value) {
    let audioSum = 0;
    for (let i = scriptProperties.minFrequency; i <= scriptProperties.maxFrequency; i++) {
        audioSum += audioBuffer.average[i];
    }
    const audioAverage = audioSum / (scriptProperties.maxFrequency - scriptProperties.minFrequency + 1);

    // Normalize the audio average within the min and max audio bounds
    let normalizedAudio = (audioAverage - scriptProperties.minAudioBounds) / (scriptProperties.maxAudioBounds - scriptProperties.minAudioBounds);
    normalizedAudio = Math.max(0, Math.min(1, normalizedAudio)); // Clamp to [0, 1]

    const audioDelta = normalizedAudio - smoothValue;
    smoothValue += audioDelta * Math.min(1.0, engine.frametime * scriptProperties.smoothing);
    smoothValue = Math.min(1.0, smoothValue);

    const color = scriptProperties.minColor.mix(scriptProperties.maxColor, smoothValue)

    // Save the color to the shared value
    shared[scriptProperties.sharedValueName] = color;

    return color;
}

export function init(value) {
    // Initialize the smooth value with the starting value if necessary
    smoothValue = 0;
}