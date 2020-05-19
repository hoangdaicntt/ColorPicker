/**
 * @fileoverview ColorPicker factory module
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 */

'use strict';

var CustomEvents = require('tui-code-snippet/customEvents/customEvents');
var extend = require('tui-code-snippet/object/extend');
var util = require('./util');
var colorUtil = require('./colorUtil');

var Layout = require('./layout');
var Palette = require('./palette');
var Slider = require('./slider');

/**
 * Create an unique id for a color-picker instance.
 * @private
 */
var currentId = 0;
function generateId() {
  currentId += 1;

  return currentId;
}

/**
 * @constructor
 * @param {object} options - options for colorpicker component
 *  @param {HTMLDivElement} options.container - container element
 *  @param {string} [options.color='#ffffff'] - default selected color
 *  @param {string[]} [options.preset] - color preset for palette (use base16 palette if not supplied)
 *  @param {string} [options.cssPrefix='tui-colorpicker-'] - css prefix text for each child elements
 *  @param {string} [options.detailTxt='Detail'] - text for detail button.
 *  @param {boolean} [options.usageStatistics=true] - Let us know the hostname. If you don't want to send the hostname, please set to false.
 * @example
 * var colorPicker = tui.colorPicker; // or require('tui-color-picker')
 *
 * var instance = colorPicker.create({
 *   container: document.getElementById('color-picker')
 * });
 */
function ColorPicker(options) {
  var layout;

  if (!(this instanceof ColorPicker)) {
    return new ColorPicker(options);
  }
  /**
   * Option object
   * @type {object}
   * @private
   */
  options = this.options = extend(
    {
      container: null,
      color: '#f8f8f8',
      preset: [

        "#fffffd", "#000000", "#2b2b2b", "#3f3f3f", "#565656", "#6d6d6d", "#848484", "#a0a0a0", "#b5b5b5", "#c0c0c0", "#cecece", "#dadada", "#e5e5e5", "#f2f2f2", "#ffffff", "#efdfe2", "#efe3e1", "#eae4da", "#e5e1d1", "#eae7d6", "#e9edda", "#ddede0", "#e4efec", "#dfebed", "#e3edf2", "#dfe3ef", "#e3e1ef", "#e9e2f2", "#f2eaf4", "#f4e6ee", "#fed9df", "#fed5cb", "#fee6c2", "#fff2c3", "#fff9c9", "#eefeb2", "#bffece", "#bdfff4", "#b8f1fe", "#b0e8fe", "#cfdaff", "#dbd2ff", "#e7cfff", "#f9d2ff", "#fed0e9", "#ffa4af", "#ffb297", "#ffcf83", "#ffe578", "#fff388", "#f0f998", "#9fffb3", "#a0f2e2", "#7be6ff", "#7dd4ff", "#b3c7ff", "#bfb0ff", "#d6abff", "#f4a9ff", "#fd9ed1", "#ff5572", "#ff8a66", "#f4b460", "#f2d86d", "#fce963", "#e0f48c", "#8eef9d", "#8fead9", "#80d9e8", "#5cc1ff", "#7da5ff", "#9988ff", "#b678ff", "#ea83ff", "#fd72ca", "#f9354c", "#f76943", "#ffb133", "#f2d455", "#f9e535", "#d1f746", "#5ded6b", "#61f2d9", "#57d5ea", "#39aaff", "#407bff", "#6b48ff", "#915cf7", "#d959ef", "#fc46a8", "#ff0013", "#ff4800", "#ffa300", "#ffce00", "#ffec00", "#bbff00", "#00ff4e", "#00ffda", "#00c9ff", "#007aff", "#0031ff", "#3e00ff", "#8f00ff", "#e600ff", "#fc1681", "#e2142d", "#e24610", "#e09722", "#e2b80a", "#eac800", "#b1e007", "#00ea3d", "#1fdbb7", "#10bae2", "#0e78d8", "#002ec1", "#3636ba", "#6f2ebc", "#c813e2", "#de2386", "#c1112f", "#c13610", "#c98b27", "#c19d0a", "#ccb409", "#a2c914", "#06c633", "#1fb598", "#14a9c1", "#0068c6", "#002a91", "#2020b7", "#5816b7", "#b00ecc", "#b8287c", "#aa0b2d", "#a52a0e", "#af761b", "#8c7206", "#a08e10", "#85a317", "#24aa3d", "#1c8e78", "#0096af", "#005a9e", "#0b316d", "#1212a0", "#33048e", "#8f15ad", "#8f1f65", "#820828", "#841e0d", "#723e00", "#6b5600", "#685d12", "#66702e", "#298939", "#237061", "#117a8c", "#004466", "#012354", "#0e0e7f", "#281868", "#69187c", "#712057", "#560a22", "#5e180e", "#563610", "#4f420b", "#443f15", "#3f4c11", "#215127", "#174940", "#085663", "#063244", "#061d38", "#16104c", "#10064c", "#440e51", "#531342"
      ],
      cssPrefix: 'hd-colorpicker-',
      detailTxt: 'Detail',
      id: generateId(),
      usageStatistics: true
    },
    options
  );

  if (!options.container) {
    throw new Error('ColorPicker(): need container option.');
  }

  /**********
   * Create layout view
   **********/

  /**
   * @type {Layout}
   * @private
   */
  layout = this.layout = new Layout(options, options.container);

  /**********
   * Create palette view
   **********/
  this.palette = new Palette(options, layout.container);
  this.palette.on(
    {
      _selectColor: this._onSelectColorInPalette,
      _toggleSlider: this._onToggleSlider
    },
    this
  );

  /**********
   * Create slider view
   **********/
  this.slider = new Slider(options, layout.container);
  this.slider.on('_selectColor', this._onSelectColorInSlider, this);

  /**********
   * Add child views
   **********/
  layout.addChild(this.palette);
  layout.addChild(this.slider);

  this.render(options.color);

  if (options.usageStatistics) {
    // util.sendHostName();
  }
}

/**
 * Handler method for Palette#_selectColor event
 * @private
 * @fires ColorPicker#selectColor
 * @param {object} selectColorEventData - event data
 */
ColorPicker.prototype._onSelectColorInPalette = function(selectColorEventData) {
  var color = selectColorEventData.color;
  var opt = this.options;

  if (!colorUtil.isValidRGB(color) && color !== '') {
    this.render();

    return;
  }

  /**
   * @event ColorPicker#selectColor
   * @type {object}
   * @property {string} color - selected color (hex string)
   * @property {string} origin - flags for represent the source of event fires.
   */
  this.fire('selectColor', {
    color: color,
    origin: 'palette'
  });

  if (opt.color === color) {
    return;
  }

  opt.color = color;
  this.render(color);
};

/**
 * Handler method for Palette#_toggleSlider event
 * @private
 */
ColorPicker.prototype._onToggleSlider = function() {
  this.slider.toggle(!this.slider.isVisible());
};

/**
 * Handler method for Slider#_selectColor event
 * @private
 * @fires ColorPicker#selectColor
 * @param {object} selectColorEventData - event data
 */
ColorPicker.prototype._onSelectColorInSlider = function(selectColorEventData) {
  var color = selectColorEventData.color;
  var opt = this.options;

  /**
   * @event ColorPicker#selectColor
   * @type {object}
   * @property {string} color - selected color (hex string)
   * @property {string} origin - flags for represent the source of event fires.
   * @ignore
   */
  this.fire('selectColor', {
    color: color,
    origin: 'slider'
  });

  if (opt.color === color) {
    return;
  }

  opt.color = color;
  this.palette.render(color);
};

/**********
 * PUBLIC API
 **********/

/**
 * Set color to colorpicker instance.<br>
 * The string parameter must be hex color value
 * @param {string} hexStr - hex formatted color string
 * @example
 * instance.setColor('#ffff00');
 */
ColorPicker.prototype.setColor = function(hexStr) {
  if (!colorUtil.isValidRGB(hexStr)) {
    throw new Error('ColorPicker#setColor(): need valid hex string color value');
  }

  this.options.color = hexStr;
  this.render(hexStr);
};

/**
 * Get hex color string of current selected color in colorpicker instance.
 * @returns {string} hex string formatted color
 * @example
 * instance.setColor('#ffff00');
 * instance.getColor(); // '#ffff00';
 */
ColorPicker.prototype.getColor = function() {
  return this.options.color;
};

/**
 * Toggle colorpicker element. set true then reveal colorpicker view.
 * @param {boolean} [isShow=false] - A flag to show
 * @example
 * instance.toggle(false); // hide
 * instance.toggle(); // hide
 * instance.toggle(true); // show
 */
ColorPicker.prototype.toggle = function(isShow) {
  this.layout.container.style.display = !!isShow ? 'block' : 'none';
};

/**
 * Render colorpicker
 * @param {string} [color] - selected color
 * @ignore
 */
ColorPicker.prototype.render = function(color) {
  this.layout.render(color || this.options.color);
};

/**
 * Destroy colorpicker instance.
 * @example
 * instance.destroy(); // DOM-element is removed
 */
ColorPicker.prototype.destroy = function() {
  this.layout.destroy();
  this.options.container.innerHTML = '';

  this.layout = this.slider = this.palette = this.options = null;
};

CustomEvents.mixin(ColorPicker);

module.exports = ColorPicker;
