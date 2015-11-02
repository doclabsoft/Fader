/**
* Slide renderer.
* @project UI flicksliders.
* @author Anton Parkhomenko
* @version 1.0
*/

goog.provide('DD.ui.flickSliders.renderer.Slide');

goog.require('DD.ui.renderer.Component');

/**
 * @constructor
 * @extends DD.ui.renderer.Component
 */
DD.ui.flickSliders.renderer.Slide = function()
{
	DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.flickSliders.renderer.Slide, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.flickSliders.renderer.Slide);

/**
 * @inheritdoc
 */
DD.ui.flickSliders.renderer.Slide.CSS_CLASS = 'DD--slide';

goog.scope(function()
{
	/** @alias DD.ui.flickSliders.renderer.Slide */
	var prototype = DD.ui.flickSliders.renderer.Slide.prototype;
	var superClass_ = DD.ui.flickSliders.renderer.Slide.superClass_;


	/**
	 * @inheritdoc
	 */
	prototype.tagName = 'slide';

	/**
	 * @inheritdoc
	 */
	prototype.getCssClass = function()
	{
	  return DD.ui.flickSliders.renderer.Slide.CSS_CLASS;
	};
}); // goog.scope
