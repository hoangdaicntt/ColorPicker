/**
 * @fileoverview Color palette view
 * @author NHN. FE Development Team <dl_javascript@nhn.com>
 */

'use strict';

var CustomEvents = require('tui-code-snippet/customEvents/customEvents');
var getTarget = require('tui-code-snippet/domEvent/getTarget');
var off = require('tui-code-snippet/domEvent/off');
var on = require('tui-code-snippet/domEvent/on');
var hasClass = require('tui-code-snippet/domUtil/hasClass');
var extend = require('tui-code-snippet/object/extend');
var inherit = require('tui-code-snippet/inheritance/inherit');

var domUtil = require('./core/domUtil');
var colorUtil = require('./colorUtil');
var View = require('./core/view');
var tmpl = require('../template/palette');

/**
 * @constructor
 * @extends {View}
 * @mixes CustomEvents
 * @param {object} options - options for color palette view
 * @param {string[]} options.preset - color list
 * @param {HTMLDivElement} container - container element
 * @ignore
 */
function Palette(options, container) {
    /**
     * option object
     * @type {object}
     */
    this.options = extend(
        {
            cssPrefix: 'hd-colorpicker-',
            preset: [
                "#000000", "#171717", "#2b2b2b", "#3f3f3f", "#565656", "#6d6d6d", "#848484", "#a0a0a0", "#b5b5b5", "#c0c0c0", "#cecece", "#dadada", "#e5e5e5", "#f2f2f2", "#ffffff", "#efdfe2", "#efe3e1", "#eae4da", "#e5e1d1", "#eae7d6", "#e9edda", "#ddede0", "#e4efec", "#dfebed", "#e3edf2", "#dfe3ef", "#e3e1ef", "#e9e2f2", "#f2eaf4", "#f4e6ee", "#fed9df", "#fed5cb", "#fee6c2", "#fff2c3", "#fff9c9", "#eefeb2", "#bffece", "#bdfff4", "#b8f1fe", "#b0e8fe", "#cfdaff", "#dbd2ff", "#e7cfff", "#f9d2ff", "#fed0e9", "#ffa4af", "#ffb297", "#ffcf83", "#ffe578", "#fff388", "#f0f998", "#9fffb3", "#a0f2e2", "#7be6ff", "#7dd4ff", "#b3c7ff", "#bfb0ff", "#d6abff", "#f4a9ff", "#fd9ed1", "#ff5572", "#ff8a66", "#f4b460", "#f2d86d", "#fce963", "#e0f48c", "#8eef9d", "#8fead9", "#80d9e8", "#5cc1ff", "#7da5ff", "#9988ff", "#b678ff", "#ea83ff", "#fd72ca", "#f9354c", "#f76943", "#ffb133", "#f2d455", "#f9e535", "#d1f746", "#5ded6b", "#61f2d9", "#57d5ea", "#39aaff", "#407bff", "#6b48ff", "#915cf7", "#d959ef", "#fc46a8", "#ff0013", "#ff4800", "#ffa300", "#ffce00", "#ffec00", "#bbff00", "#00ff4e", "#00ffda", "#00c9ff", "#007aff", "#0031ff", "#3e00ff", "#8f00ff", "#e600ff", "#fc1681", "#e2142d", "#e24610", "#e09722", "#e2b80a", "#eac800", "#b1e007", "#00ea3d", "#1fdbb7", "#10bae2", "#0e78d8", "#002ec1", "#3636ba", "#6f2ebc", "#c813e2", "#de2386", "#c1112f", "#c13610", "#c98b27", "#c19d0a", "#ccb409", "#a2c914", "#06c633", "#1fb598", "#14a9c1", "#0068c6", "#002a91", "#2020b7", "#5816b7", "#b00ecc", "#b8287c", "#aa0b2d", "#a52a0e", "#af761b", "#8c7206", "#a08e10", "#85a317", "#24aa3d", "#1c8e78", "#0096af", "#005a9e", "#0b316d", "#1212a0", "#33048e", "#8f15ad", "#8f1f65", "#820828", "#841e0d", "#723e00", "#6b5600", "#685d12", "#66702e", "#298939", "#237061", "#117a8c", "#004466", "#012354", "#0e0e7f", "#281868", "#69187c", "#712057", "#560a22", "#5e180e", "#563610", "#4f420b", "#443f15", "#3f4c11", "#215127", "#174940", "#085663", "#063244", "#061d38", "#16104c", "#10064c", "#440e51", "#531342"
            ],
            detailTxt: 'Detail'
        },
        options
    );

    container = domUtil.appendHTMLElement(
        'div',
        container,
        this.options.cssPrefix + 'palette-container'
    );

    View.call(this, options, container);
}

inherit(Palette, View);

/**
 * Mouse click event handler
 * @fires Palette#_selectColor
 * @fires Palette#_toggleSlider
 * @param {MouseEvent} clickEvent - mouse event object
 */
Palette.prototype._onClick = function (clickEvent) {
    var options = this.options;
    var target = getTarget(clickEvent);
    var eventData = {};

    if (hasClass(target, options.cssPrefix + 'palette-button')) {
        eventData.color = target.value;

        /**
         * @event Palette#_selectColor
         * @type {object}
         * @property {string} color - selected color value
         */
        this.fire('_selectColor', eventData);

        return;
    }

    if (hasClass(target, options.cssPrefix + 'palette-toggle-slider')) {
        /**
         * @event Palette#_toggleSlider
         */
        // console.log(target, clickEvent);
        // this.fire('_toggleSlider');
        if (document.querySelector('.hd-colorpicker-slider-container').classList.contains('show')) {
            document.querySelector('.hd-colorpicker-slider-container').classList.remove('show');
        } else {
            document.querySelector('.hd-colorpicker-slider-container').classList.add('show');
        }
    }
};

/**
 * Textbox change event handler
 * @fires Palette#_selectColor
 * @param {Event} changeEvent - change event object
 */
Palette.prototype._onChange = function (changeEvent) {
    var options = this.options;
    var target = getTarget(changeEvent);
    var eventData = {};

    if (hasClass(target, options.cssPrefix + 'palette-hex')) {
        eventData.color = target.value;

        /**
         * @event Palette#_selectColor
         * @type {object}
         * @property {string} color - selected color value
         */
        this.fire('_selectColor', eventData);
    }
};

/**
 * Invoke before destory
 * @override
 */
Palette.prototype._beforeDestroy = function () {
    this._toggleEvent(false);
};

/**
 * Toggle view DOM events
 * @param {boolean} [toBind=false] - true to bind event.
 */
Palette.prototype._toggleEvent = function (toBind) {
    var options = this.options;
    var container = this.container;
    var handleEvent = toBind ? on : off;
    var hexTextBox;

    handleEvent(container, 'click', this._onClick, this);

    hexTextBox = container.querySelector('.' + options.cssPrefix + 'palette-hex', container);

    if (hexTextBox) {
        handleEvent(hexTextBox, 'change', this._onChange, this);
    }
};

/**
 * Render palette
 * @override
 */
Palette.prototype.render = function (color) {
    var options = this.options;
    var html = '';

    this._toggleEvent(false);

    html = tmpl({
        cssPrefix: options.cssPrefix,
        preset: options.preset,
        detailTxt: options.detailTxt,
        color: color,
        isValidRGB: colorUtil.isValidRGB,
        getItemClass: function (itemColor) {
            return !itemColor ? ' ' + options.cssPrefix + 'color-transparent' : '';
        },
        isSelected: function (itemColor) {
            return itemColor === color ? ' ' + options.cssPrefix + 'selected' : '';
        }
    });
    this.container.innerHTML = html;

    this._toggleEvent(true);
};

CustomEvents.mixin(Palette);

module.exports = Palette;
