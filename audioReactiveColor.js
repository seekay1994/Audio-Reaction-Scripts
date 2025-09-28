'use strict';

export var scriptProperties = createScriptProperties()
    .addSlider({ name: 'frequencyMin',		label: 'Frequency Min', 		value: 0, 	min: 0,		max: 31, integer: true })
    .addSlider({ name: 'frequencyMax',		label: 'Frequency Max', 		value: 31, 	min: 0,		max: 31, integer: true })
    .addSlider({ name: 'smoothing',			label: 'Smoothing (inverted)',	value: 16, 	min: 0,		max: 32, integer: true })
    .addColor({  name: 'minColor',			label: 'Minimum Color',			value: new Vec3(0, 0, 0) })    
    .addColor({  name: 'maxColor',			label: 'Maximum Color',			value: new Vec3(1, 1, 1) })
    .addSlider({ name: 'minAudioBounds',	label: 'Minimum Audio Bound',	value: 0.0, min: 0.0, 	max: 1.0 })
    .addSlider({ name: 'maxAudioBounds',	label: 'Maximum Audio Bound',	value: 1.0, min: 0.0, 	max: 1.0 })
    .addCombo({  name: 'audioChannel',		label: 'Audio Channel',         options: [
              { label: 'Both Channels',		value: 'both'},
              { label: 'Left Channel',		value: 'left'},
              { label: 'Right Channel',		value: 'right'}
    ]})	
    .addText({ name: 'sharedValueName', label: 'Shared Value Name', value: 'sharedAudioColorValue' })
.finish();

const audioBuffer = engine.registerAudioBuffers(engine.AUDIO_RESOLUTION_32);
let smoothValue = 0;

export function update() {
    const frequencyMin = Math.min(scriptProperties.frequencyMin, scriptProperties.frequencyMax);
    const frequencyMax = Math.max(scriptProperties.frequencyMin, scriptProperties.frequencyMax);

    let audioAverage = 0;
    let sampleCount = 0;

    const channel = scriptProperties.audioChannel;
    const processLeft = channel === 'left' || channel === 'both';
    const processRight = channel === 'right' || channel === 'both';

    for (let i = frequencyMin; i <= frequencyMax; i++) {
        let sample = 0;
        if (processLeft) sample += audioBuffer.left[i];
        if (processRight) sample += audioBuffer.right[i];
        if (processLeft && processRight) sample *= 0.5;
        audioAverage += sample;
        sampleCount++;
    }

    if (sampleCount > 0) {
        audioAverage /= sampleCount;
    }

    const minAudioBounds = scriptProperties.minAudioBounds;
    const maxAudioBounds = scriptProperties.maxAudioBounds;
    let normalizedAudio = (audioAverage - minAudioBounds) / (maxAudioBounds - minAudioBounds);
    normalizedAudio = Math.max(0, Math.min(1, normalizedAudio));

    const audioDelta = normalizedAudio - smoothValue;
    smoothValue += audioDelta * Math.min(1.0, engine.frametime * scriptProperties.smoothing);
    smoothValue = Math.min(1.0, smoothValue);

    const resultColor = scriptProperties.minColor.mix(scriptProperties.maxColor, smoothValue);
    shared[scriptProperties.sharedValueName] = resultColor;

    return resultColor;
}