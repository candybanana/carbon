'use strict';

var Utils = require('../utils');
var Component = require('../component');
var Loader = require('../loader');
// var I18n = require('../i18n');


/**
 * HTMLComponent main.
 * @param {Object} optParams Optional params to initialize the HTMLComponent object.
 * Default:
 *   {
 *     src: '',
 *     caption: null,
 *     width: '100%'
 *     name: Utils.getUID()
 *   }
 */
var HTMLComponent = function(optParams) {
  // Override default params with passed ones if any.
  var params = Utils.extend({
    html: '',
  }, optParams);

  Component.call(this, params);

  /**
   * Internal model text in this HTMLComponent.
   * @type {string}
   */
  this.html = params.html;

  /**
   * DOM element tied to this object.
   * @type {HTMLElement}
   */
  this.dom = document.createElement(HTMLComponent.TAG_NAME);
  this.dom.setAttribute('contenteditable', false);
  this.dom.setAttribute('name', this.name);
  this.dom.className = 'html-embed';
};
HTMLComponent.prototype = Object.create(Component.prototype);
module.exports = HTMLComponent;


/**
 * String name for the component class.
 * @type {string}
 */
HTMLComponent.CLASS_NAME = 'HTMLComponent';
Loader.register(HTMLComponent.CLASS_NAME, HTMLComponent);

/**
 * HTMLComponent component element tag name.
 * @type {string}
 */
HTMLComponent.TAG_NAME = 'figure';

/**
 * HTMLComponent component container element tag name.
 * @type {string}
 */
HTMLComponent.CONTAINER_TAG_NAME = 'div';

/**
 * EmbeddedComponent component inner container element class name.
 * @type {string}
 */
HTMLComponent.CONTAINER_CLASS_NAME = 'inner-container';

/**
 * Caption element tag name.
 * @type {string}
 */
HTMLComponent.CAPTION_TAG_NAME = 'figcaption';

/**
 * OVerlay tag name. Used to overlay on top of the embed and prevent accidental interaction with embed content.
 * @type {string}
 */
HTMLComponent.OVERLAY_TAG_NAME = 'div';

/**
 * Overlay class name.
 * @type {string}
 */
HTMLComponent.OVERLAY_CLASS_NAME = 'embed-overlay';

/**
 * Regex strings list that for matching Giphy search terms.
 * @type {Array.<string>}
 */
// HTMLComponent.GIPHY_SEARCH_REGEX = '^\\+giphy\\s(.+[a-zA-Z])$';


/**
 * Giphy endpoint for random search.
 * Ref: https://github.com/Giphy/GiphyAPI
 * @type {String.<string>}
 */
// HTMLComponent.GIPHY_RANDOM_ENDPOINT = 'https://api.giphy.com/v1/gifs/random?' +
      // 'api_key=dc6zaTOxFJmzC&' +
      // 'tag=';


/**
 * Create and initiate a giphy object from JSON.
 * @param  {Object} json JSON representation of the giphy.
 * @return {HTMLComponent} HTMLComponent object representing the JSON data.
 */
HTMLComponent.fromJSON = function (json) {
  return new HTMLComponent(json);
};


/**
 * Handles onInstall when the HTMLComponent module installed in an editor.
 * @param  {Editor} editor Instance of the editor that installed the module.
 */
HTMLComponent.onInstall = function(editor) {
  HTMLComponent.registerRegexes_(editor);

  // TODO(mkhatib): Initialize a toolbar for all giphy components instances.
};


/**
 * Registers regular experessions to create giphy component from if matched.
 * @param  {Editor} editor The editor to register regexes with.
 * @private
 */
// HTMLComponent.registerRegexes_ = function(editor) {
//   editor.registerRegex(
//       I18n.get('regex.giphy') || HTMLComponent.GIPHY_SEARCH_REGEX,
//       HTMLComponent.handleMatchedRegex);
// };


/**
 * Creates a figure component from a link.
 * @param {Component} matchedComponent Component that matched registered regex.
 * @param {Function} opsCallback Callback to send list of operations to exectue.
 */
// HTMLComponent.handleMatchedRegex = function (matchedComponent, opsCallback) {

  // set up vars
  // var figure = new HTMLComponent({src: src});
  // figure.section = matchedComponent.section;


  // var giphyQuery = matchedComponent.text.split(/\s/).slice(1).join('+');

  // var atIndex = matchedComponent.getIndexInSection();
  // var ops = [];


  // Call Giphy Random Endpoint.
  // var xhttp = new XMLHttpRequest();
  // xhttp.onreadystatechange = function() {
  //   if (xhttp.readyState == 4 && xhttp.status == 200) {
  //     var src;
  //     /* jshint ignore:start */
  //     // Get the image url from the random search response.
  //     src = JSON.parse(xhttp.responseText)['data']['image_original_url'];
  //     /* jshint ignore:end */
  //     // If result is found for the query, create a component.
  //     if  (src) {
  //       var figure = new HTMLComponent({src: src});
  //       figure.section = matchedComponent.section;

  //       // Delete current matched component with its text.
  //       Utils.arrays.extend(ops, matchedComponent.getDeleteOps(atIndex));

  //       // Add the new component created from the text.
  //       Utils.arrays.extend(ops, figure.getInsertOps(atIndex));

  //       opsCallback(ops);
  //     }
  //   }
  // };
  // xhttp.open('GET', HTMLComponent.GIPHY_RANDOM_ENDPOINT + giphyQuery, true);
  // xhttp.send();
// };


/**
 * Returns the class name of this component.
 * @return {string}
 */
HTMLComponent.prototype.getComponentClassName = function() {
  return HTMLComponent.CLASS_NAME;
};


/**
 * Creates and return a JSON representation of the model.
 * @return {Object} JSON representation of this HTMLComponent.
 */
HTMLComponent.prototype.getJSONModel = function() {
  var html = {
    component: HTMLComponent.CLASS_NAME,
    name: this.name,
    html: this.html,
  };

  return html;
};


/**
 * @override
 */
HTMLComponent.prototype.render = function(element, options) {

  if (!this.isRendered) {

    Component.prototype.render.call(this, element, options);

    this.containerDom = document.createElement(
        HTMLComponent.CONTAINER_TAG_NAME);
    this.containerDom.className = HTMLComponent.CONTAINER_CLASS_NAME;

    if (this.html) {

      var div = document.createElement('div');
      div.innerHTML = this.html;

      // get script tags within the given HTML
      var scriptTags = div.getElementsByTagName('script'),
          script;

      // if any exist, process them
      if (scriptTags.length) {

        Object.keys(scriptTags).forEach(function(key,index) {

          // only execute remotely referenced script tags for the moment
          if (scriptTags[index].src) {

            // re-create the script tag
            script = document.createElement('script');
            script.src = scriptTags[index].src;

            // remove old tag
            scriptTags[index].parentNode.removeChild(scriptTags[index]);

            // append new script tag
            div.appendChild(script);
          }
        });
      }

      this.containerDom.appendChild(div);
      this.dom.appendChild(this.containerDom);
    }

    if (this.editMode) {
      // create click overlay over HTML element
      this.overlayDom = document.createElement(
          HTMLComponent.OVERLAY_TAG_NAME);
      this.overlayDom.className = HTMLComponent.OVERLAY_CLASS_NAME;
      this.containerDom.appendChild(this.overlayDom);
      this.overlayDom.addEventListener('click', this.select.bind(this));

      this.dom.addEventListener('click', this.select.bind(this));
      this.selectionDom = document.createElement('div');
      this.selectionDom.innerHTML = '&nbsp;';
      this.selectionDom.className = 'selection-pointer';
      this.selectionDom.setAttribute('contenteditable', true);
      this.selectionDom.addEventListener('focus', this.select.bind(this));
      this.dom.appendChild(this.selectionDom);
    }
  }
};


/**
 * Returns the operations to execute a deletion of the giphy component.
 * @param  {number=} optIndexOffset An offset to add to the index of the
 * component for insertion point.
 * @param {Object} optCursorAfterOp Where to move cursor to after deletion.
 * @return {Array.<Object>} List of operations needed to be executed.
 */
HTMLComponent.prototype.getDeleteOps = function (
    optIndexOffset, optCursorAfterOp) {
  var ops = [{
    do: {
      op: 'deleteComponent',
      component: this.name,
      cursor: optCursorAfterOp
    },
    undo: {
      op: 'insertComponent',
      componentClass: 'HTMLComponent',
      section: this.section.name,
      component: this.name,
      index: this.getIndexInSection() + (optIndexOffset || 0),
      attrs: {
        html: this.html,
      }
    }
  }];

  // If this is the only child of the layout delete the layout as well
  // only if there are other layouts.
  if (this.section.getLength() < 2) {
    Utils.arrays.extend(ops, this.section.getDeleteOps());
  }

  return ops;
};


/**
 * Returns the operations to execute inserting a HTMLComponent.
 * @param {number} index Index to insert the HTMLComponent at.
 * @param {Object} optCursorBeforeOp Cursor before the operation executes,
 * this helps undo operations to return the cursor.
 * @return {Array.<Object>} Operations for inserting the HTMLComponent.
 */
HTMLComponent.prototype.getInsertOps = function (index, optCursorBeforeOp) {
  return [{
    do: {
      op: 'insertComponent',
      componentClass: 'HTMLComponent',
      section: this.section.name,
      cursorOffset: 0,
      component: this.name,
      index: index,
      attrs: {
        html: this.html,
      }
    },
    undo: {
      op: 'deleteComponent',
      component: this.name,
      cursor: optCursorBeforeOp
    }
  }];
};


/**
 * Returns the length of the HTMLComponent content.
 * @return {number} Length of the HTMLComponent content.
 */
HTMLComponent.prototype.getLength = function () {
  return 1;
};
