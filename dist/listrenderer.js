/**
 * List renderer.
 * @project UI.
 * @author Anna Agte
 * @version 1.0
 */

goog.provide('DD.ui.renderer.List');

goog.require('DD.ui.renderer.Component');


// ------------------------------
// Constructor
// ------------------------------

/**
 * @constructor
 * @extends DD.ui.renderer.Component
 */
DD.ui.renderer.List = function() {
  DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.renderer.List, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.renderer.List);


// ------------------------------
// Constants
// ------------------------------

/**
 * @inheritdoc
 */
DD.ui.renderer.List.CSS_CLASS = 'DD-list';


// ------------------------------
// Prototype
// ------------------------------

goog.scope(function() {

/** @alias DD.ui.renderer.List.prototype */
var prototype = DD.ui.renderer.List.prototype;
var superClass_ = DD.ui.renderer.List.superClass_;


// ------------------------------
// Methods
// ------------------------------

/**
 * @inheritdoc
 */
prototype.getCssClass = function() {
  return DD.ui.renderer.List.CSS_CLASS;
};

/**
 * @inheritdoc
 */
prototype.canDecorate = function(element) {
  return false;
};

}); // goog.scope
