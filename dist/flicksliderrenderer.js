/**
* Flickslider renderer.
* @project UI flickSliders.
* @author Anton Parkhomenko
* @version 1.0
*/
goog.provide('DD.ui.flickSliders.renderer.FlickSlider');

goog.require('DD.ui.flickSliders.renderer');
goog.require('DD.ui.renderer.Component');
goog.require('goog.dom.classes');

/**
* Стандартный рендерер галереи
* @constructor
* @extends DD.ui.renderer.Component
*/
DD.ui.flickSliders.renderer.FlickSlider = function()
{
    DD.ui.renderer.Component.call(this);
};
goog.inherits(DD.ui.flickSliders.renderer.FlickSlider, DD.ui.renderer.Component);
goog.addSingletonGetter(DD.ui.flickSliders.renderer.FlickSlider);

/** @inheritdoc */
DD.ui.flickSliders.renderer.FlickSlider.CSS_CLASS = 'DD--FlickSlider';

goog.scope(function()
{

    /** @alias DD.ui.flickSliders.renderer.FlickSlider.prototype */
    var prototype = DD.ui.flickSliders.renderer.FlickSlider.prototype;
    var superClass_ = DD.ui.flickSliders.renderer.FlickSlider.superClass_;

    /** @inheritdoc */
    prototype.getCssClass = function()
    {
        return DD.ui.flickSliders.renderer.FlickSlider.CSS_CLASS;
    };

    /** @inheritdoc */
    prototype.createDom = function(component)
    {
        var element = superClass_.createDom.call(this, component);
        var dom = component.getDomHelper();

        goog.dom.classes.add(element, this.getCssClass());

        return element;
    };

    /** @inheritdoc */
    prototype.clearDomLinks = function (component){};
}); // goog.scope
