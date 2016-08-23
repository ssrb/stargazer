// Copyright (c) 2016, Sebastien Sydney Robert Bigot
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// The views and conclusions contained in the software and documentation are those
// of the authors and should not be interpreted as representing official policies,
// either expressed or implied, of the FreeBSD Project.

///<reference path="typings/index.d.ts"/>

declare var Blockly: any;

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#ervz52
Blockly.Blocks['starsystem'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Star System");
    this.appendStatementInput("Layers")
        .setCheck("Layer");
    this.setColour(290);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#53hy2k
Blockly.Blocks['gas'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Gas");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Inner color")
        .appendField(new Blockly.FieldColour("#000000"), "INNER_COLOR");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Outer color")
        .appendField(new Blockly.FieldColour("#3366ff"), "OUTER_COLOR");
    this.appendValueInput("MIX")
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Mix (noise)");
    this.setPreviousStatement(true, ["Nebula", "Layer"]);
    this.setNextStatement(true, "Layer");
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#r46hai
Blockly.Blocks['dwarf_stars'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Dwarf Stars");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Seed")
        .appendField(new Blockly.FieldTextInput("Gliese 623"), "SEED");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Cardinality")
        .appendField(new Blockly.FieldNumber(2000, 0), "CARDINALITY");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Size")
        .appendField(new Blockly.FieldNumber(0.001, 0), "SIZE");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Near color")
        .appendField(new Blockly.FieldColour("#ff6600"), "NEAR_COLOR");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Far color")
        .appendField(new Blockly.FieldColour("#000066"), "FAR_COLOR");
    this.appendValueInput("MASK")
        .setCheck("Mask")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Mask");
    this.setPreviousStatement(true, ["Nebula", "Layer"]);
    this.setNextStatement(true, "Layer");
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#im2r56
Blockly.Blocks['giant_stars'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Giant Stars");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Seed")
        .appendField(new Blockly.FieldTextInput("entropy"), "SEED");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Cardinality")
        .appendField(new Blockly.FieldNumber(0, 0), "CARDINALITY");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Size")
        .appendField(new Blockly.FieldNumber(0, 0), "SIZE");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Near color")
        .appendField(new Blockly.FieldColour("#ff6600"), "NEAR_COLOR");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Far color")
        .appendField(new Blockly.FieldColour("#3366ff"), "FAR_COLOR");
    this.appendValueInput("MASK")
        .setCheck("Mask")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Mask");
    this.setPreviousStatement(true, ["Nebula", "Layer"]);
    this.setNextStatement(true, "Layer");
    this.setColour(290);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#kev9rm
Blockly.Blocks['fbm_noise'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Fractal Brownian motion noise");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Seed")
        .appendField(new Blockly.FieldTextInput("I ❤ browny"), "SEED");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Octaves")
        .appendField(new Blockly.FieldNumber(2, 0), "OCTAVES");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Gain")
        .appendField(new Blockly.FieldNumber(0.5, 0), "GAIN");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Scale")
        .appendField(new Blockly.FieldNumber(1, 0), "SCALE");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Power")
        .appendField(new Blockly.FieldNumber(1, 0), "POWER");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Dither")
        .appendField(new Blockly.FieldNumber(0.03, 0), "DITHER");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Lacunarity")
        .appendField(new Blockly.FieldNumber(2, 0), "LACUNARITY");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Threshold")
        .appendField(new Blockly.FieldNumber(0, 0), "THRESHOLD");
    this.setOutput(true, null);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#s59utj
Blockly.Blocks['rfbm_noise'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Ridged FBM noise");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Seed")
        .appendField(new Blockly.FieldTextInput("I ❤ browny"), "SEED");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Octaves")
        .appendField(new Blockly.FieldNumber(2, 0), "OCTAVES");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Gain")
        .appendField(new Blockly.FieldNumber(0.5, 0), "GAIN");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Scale")
        .appendField(new Blockly.FieldNumber(1, 0), "SCALE");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Offset")
        .appendField(new Blockly.FieldNumber(1, 0), "OFFSET");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Power")
        .appendField(new Blockly.FieldNumber(1, 0), "POWER");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Dither")
        .appendField(new Blockly.FieldNumber(0.03, 0), "DITHER");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Lacunarity")
        .appendField(new Blockly.FieldNumber(2, 0), "LACUNARITY");
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Threshold")
        .appendField(new Blockly.FieldNumber(0, 0), "THRESHOLD");
    this.setOutput(true, null);
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};