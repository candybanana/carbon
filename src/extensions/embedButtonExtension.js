'use strict';

var Utils = require('../utils');
var Errors = require('../errors');
var Loader = require('../loader');
var Button = require('../toolbars/button');
var EmbeddedComponent = require('./embeddedComponent');
// var Paragraph = require('../paragraph');
// var I18n = require('../i18n');

/**
 * EmbedButtonExtension allows embedding different kind of components using
 * different providers.
 * @param {Object} optParams Config params.
 * @constructor
 */
var EmbedButtonExtension = function (optParams) {
  var params = Utils.extend({
    editor: null,
    embedProviders: null,
    ComponentClass: null
  }, optParams);

  /**
   * A reference to the editor this extension is enabled in.
   * @type {Editor}
   */
  this.editor = params.editor;

  /**
   * Maps the different providers with their instances.
   * @type {Object}
   */
  this.embedProviders = params.embedProviders;

  /**
   * The component class to use for embedding.
   * @type {Component}
   */
  this.ComponentClass = params.ComponentClass;
};
module.exports = EmbedButtonExtension;


/**
 * Extension class name.
 * @type {string}
 */
EmbedButtonExtension.CLASS_NAME = 'EmbedButtonExtension';


/**
 * Name of the block toolbar.
 * @type {string}
 */
EmbedButtonExtension.BLOCK_TOOLBAR_NAME = 'block-toolbar';

/**
 * Instantiate an instance of the extension and configure it.
 * @param  {Editor} editor Instance of the editor installing this extension.
 * @param  {Object} config Configuration for the extension.
 * @static
 */
EmbedButtonExtension.onInstall = function (editor, config) {

  if (!config.embedProviders || ! config.ComponentClass) {
    throw Errors.ConfigrationError(
        'EmbedButtonExtension needs "embedProviders" and "ComponentClass"');
  }

  var extension = new EmbedButtonExtension({
    embedProviders: config.embedProviders,
    ComponentClass: config.ComponentClass,
    editor: editor
  });

  // Register the embedProviders with the loader to allow components to
  // access them. Force this?
  Loader.register('embedProviders', config.embedProviders, true);
  extension.init();
};


/**
 * Registers the different regexes for each provider.
 */
EmbedButtonExtension.prototype.init = function() {
  var self = this;

  // get block toolbar instance
  this.blockToolbar = this.editor.getToolbar(EmbedButtonExtension.BLOCK_TOOLBAR_NAME);

  // add button to toolbar
  var insertButton = new Button({
    name: 'embed',
    label: '+'
  });
  // insertButton.setVisible(false);
  // insertButton.addEventListener('click', this.handleInsertClicked.bind(this));

  this.blockToolbar.addButton(insertButton);


  /**
   * Callback wrapper to allow passing provider for the callback.
   * @param  {string} provider Provider name.
   * @return {Function} Regex match handler.
   */
  var handleRegexMatchProvider = function(provider) {
    return function(matchedComponent, opsCallback) {
      self.handleRegexMatch(matchedComponent, opsCallback, provider);
    };
  };

  // Register regexes in each provider.
  for (var provider in this.embedProviders) {
    var regexStr = this.embedProviders[provider].getUrlsRegex();
    this.editor.registerRegex(regexStr, handleRegexMatchProvider(provider));
  }

  // this.toolbelt = this.editor.getToolbar(
      // EmbedButtonExtension.TOOLBELT_TOOLBAR_NAME);

  // Add embedding buttons to the toolbelt.
  // var toolbeltButtons = [{
  //   label: I18n.get('button.video'),
  //   icon: I18n.get('button.icon.video'),
  //   placeholder: I18n.get('placeholder.video')
  // }, {
  //   label: I18n.get('button.photo'),
  //   icon: I18n.get('button.icon.photo'),
  //   placeholder: I18n.get('placeholder.photo')
  // }, {
  //   label: I18n.get('button.post'),
  //   icon: I18n.get('button.icon.post'),
  //   placeholder: I18n.get('placeholder.post')
  // }, {
  //   label: I18n.get('button.gif'),
  //   icon: I18n.get('button.icon.gif'),
  //   placeholder: I18n.get('placeholder.gif')
  // }, {
  //   label: I18n.get('button.quiz'),
  //   icon: I18n.get('button.icon.quiz'),
  //   placeholder: I18n.get('placeholder.quiz')
  // }];

  // for (var i = 0; i < toolbeltButtons.length; i++) {
  //   var insertVideoButton = new Button({
  //     label: toolbeltButtons[i].label,
  //     icon: toolbeltButtons[i].icon,
  //     data: { placeholder: toolbeltButtons[i].placeholder }
  //   });
  //   insertVideoButton.addEventListener(
  //       'click', this.handleInsertClicked.bind(this));
  //   this.toolbelt.addButton(insertVideoButton);
  // }
};


// EmbedButtonExtension.prototype.handleInsertClicked = function(event) {

  // open dialog
  // console.log('Opening embed dialog...');

  // embed dialog will do insersion

  // var button = event.detail.target;
  // var placeholder = button.data.placeholder;
  // var newP = new Paragraph({
  //   placeholderText: placeholder,
  //   section: this.editor.selection.getSectionAtStart()
  // });

  // var index = this.editor.selection.getComponentAtStart().getIndexInSection();
  // this.editor.article.transaction(newP.getInsertOps(index));
// };

// CUSTOM CREO FUNCTIONALITY
EmbedButtonExtension.insertEmbed = function (editor, config) {

  // var newEmbed = new EmbeddedComponent({
  //   url: "https://videogamer.com/media/deus-ex-mankind-divided1111111",
  //   type: "image",
  //   provider: "creo",
  //   serviceName: "VideoGamer",
  //   section: editor.selection.getSectionAtStart()
  // });

  var newEmbed     = new EmbeddedComponent(config),
      curComponent = editor.selection.getComponentAtStart(),
      index        = curComponent.getIndexInSection();

  // delete current matched component (created Paragraph)
  editor.article.transaction(curComponent.getDeleteOps(index));

  // insert embed
  editor.article.transaction(newEmbed.getInsertOps(index));
};
// END CUSTOM CREO FUNCTIONALITY

/**
 * Handles regex match by instantiating a component.
 * @param {Component} matchedComponent Component that matched registered regex.
 * @param {Function} opsCallback Callback to send list of operations to exectue.
 * @param  {string} provider Embed provider name.
 */
EmbedButtonExtension.prototype.handleRegexMatch = function(
    matchedComponent, opsCallback, provider) {
  var atIndex = matchedComponent.getIndexInSection();
  var ops = [];
  var embeddedComponent = new this.ComponentClass({
    url: matchedComponent.text,
    provider: provider
  });
  embeddedComponent.section = matchedComponent.section;

  // Delete current matched component with its text.
  Utils.arrays.extend(ops, matchedComponent.getDeleteOps(atIndex));

  // Add the new component created from the text.
  Utils.arrays.extend(ops, embeddedComponent.getInsertOps(atIndex));

  opsCallback(ops);
};
