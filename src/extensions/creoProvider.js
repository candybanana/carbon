'use strict';

var AbstractEmbedProvider = require('./abstractEmbedProvider');
var Utils = require('../utils');


/**
 * Provides an Embed Provider using Embedly APIs.
 * @param {Object=} optParams Config params.
 *   required: apiKey
 * @constructor
 */
var CreoProvider = function (optParams) {
  var params = Utils.extend({
    endpoint: '/ajax/oembed',
    apiKey: null,
  }, optParams);

  /**
   * Embedly oembed endpoint.
   * @type {string}
   */
  this.endpoint = params.endpoint;

  /**
   * API Key for embedly app.
   * @type {string}
   */
  this.apiKey = params.apiKey;

  AbstractEmbedProvider.call(this, params);
};
CreoProvider.prototype = Object.create(AbstractEmbedProvider.prototype);
module.exports = CreoProvider;


/**
 * Regex string for all URLs embedly provider can handle.
 *
 * @todo: test these + lock down the exact videogamer urls allowed
 * @todo: need twitch! .*twitch\.tv/.*|.*twitch\.tv/.*\/b/.*|
 *
 * @constant
 */
CreoProvider.SUPPORTED_URLS_REGEX_STRING = '^((https?://(www\.flickr\.com/photos/.*|flic\.kr/.*|www\.slideshare\.net/.*/.*|www\.slideshare\.net/mobile/.*/.*|.*\.slideshare\.net/.*/.*|slidesha\.re/.*|www\.kickstarter\.com/projects/.*/.*|www\.gettyimages\.com/detail/photo/.*|gty\.im/.*|.*youtube\.com/watch.*|.*\.youtube\.com/v/.*|youtu\.be/.*|.*\.youtube\.com/user/.*|.*\.youtube\.com/.*#.*/.*|m\.youtube\.com/watch.*|m\.youtube\.com/index.*|.*\.youtube\.com/profile.*|.*\.youtube\.com/view_play_list.*|.*\.youtube\.com/playlist.*|www\.youtube\.com/embed/.*|youtube\.com/gif.*|www\.youtube\.com/gif.*|www\.youtube\.com/attribution_link.*|youtube\.com/attribution_link.*|youtube\.ca/.*|youtube\.jp/.*|youtube\.com\.br/.*|youtube\.co\.uk/.*|youtube\.nl/.*|youtube\.pl/.*|youtube\.es/.*|youtube\.ie/.*|it\.youtube\.com/.*|youtube\.fr/.*|vine\.co/v/.*|www\.vine\.co/v/.*|www\.vimeo\.com/groups/.*/videos/.*|www\.vimeo\.com/.*|vimeo\.com/groups/.*/videos/.*|vimeo\.com/.*|vimeo\.com/m/#/.*|player\.vimeo\.com/.*|www\.facebook\.com/video\.php.*|www\.facebook\.com/.*/posts/.*|fb\.me/.*|www\.facebook\.com/.*/videos/.*|fb\.com|soundcloud\.com/.*|soundcloud\.com/.*/.*|soundcloud\.com/.*/sets/.*|soundcloud\.com/groups/.*|snd\.sc/.*|videogamer\..*/.*)))';

/**
 * Call the proper endpoint for the passed URL and send the response back
 * by passing it to a callabck.
 * @param {string} url Url to get the oembed response for.
 * @param {Function} callback A callback function to call with the result.
 * @param {Object=} optArgs Optional arguments to pass with the URL.
 */
CreoProvider.prototype.getEmbedForUrl = function(
    url, callback, optArgs) {
  var endpoint = this.getOEmbedEndpointForUrl(url, optArgs);
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4) {
      var json = JSON.parse(xhttp.responseText);
      callback(json);
    }
  };
  xhttp.open('GET', endpoint, true);
  xhttp.send();
};


/**
 * Returns the URL to call for oembed response.
 * @param {string} url URL to create the url for.
 * @param {Object} optArgs Arguments to pass with the URL.
 * @return {string}
 */
CreoProvider.prototype.getOEmbedEndpointForUrl = function(url, optArgs) {
  var urlParams = Utils.extend({
    key: this.apiKey,
    // luxe: 1,
    url: url
  }, optArgs);
  var queryParts = [];
  for (var name in urlParams) {
    queryParts.push([name, urlParams[name]].join('='));
  }
  return [this.endpoint, queryParts.join('&')].join('?');
};


/**
 * Returns the regex string this provider want to provide the embed for.
 * @return {string}
 */
CreoProvider.prototype.getUrlsRegex = function() {
  return CreoProvider.SUPPORTED_URLS_REGEX_STRING;
};
