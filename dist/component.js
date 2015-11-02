/**
 * @overview Base ui component. Similar to goog.ui.Component, except it always uses renderers.
 * @project UI.
 * @author Anna Agte
 * @version 2.0
 */

goog.provide('DD.ui.Component');

goog.require('goog.ui.Component');
goog.require('DD.ui.EventType');
goog.require('DD.ui.renderer.Component');
goog.require('goog.ui.registry');


// ------------------------------
// Constructor
// ------------------------------

/**
 * @param {Object=} options
 * @param {string=} options.id Component's unique id.
 * @param {string=} options.nodeId Dom element's id.
 * @param {string=} options.cssPrefix Element's renderer css class.
 * @param {string=} options.cssClass Element's css class
     or classes splitted by spaces. Additional to cssPrefix.
 * @param {boolean=} options.disabled State disabled.
 *    Used mostly by clickable components.
 * @param {boolean=} options.readonly State readonly.
 *    Used mostly by editable controls.
 * @param {boolean=} options.checked State checked.
 *    Used mostly by checkboxes and radiobuttons.
 * @param {boolean=} options.selected State selected.
 * @param {boolean=} options.opened State opened.
 *    Used mostly by dropdown components.
 * @param {boolean=} options.active State active.
 * @param {boolean=} options.focused State focused.
 * @param {boolean=} options.indeterminate State indeterminate.
 *    Used mostly by checkboxes.
 * @param {goog.dom.DomHelper=} options.domHelper Google closure dom helper.
 * @constructor
 * @extends goog.ui.Component 
 */
DD.ui.Component = function(options) {

  goog.isObject(options) || (options = null);

  var domHelper = null;
  if (options && goog.isObject(options.domHelper) &&
      options.domHelper instanceof goog.dom.DomHelper) {
    domHelper = options.domHelper;
  }

  goog.ui.Component.call(this, domHelper);
  this.renderer_ = goog.ui.registry.getDefaultRenderer(this.constructor);

  if (options) {
    this.beginUpdate();
    this.assign(options);
    this.endUpdate(false);
  }
};
goog.inherits(DD.ui.Component, goog.ui.Component);
goog.ui.registry.setDefaultRenderer(DD.ui.Component, DD.ui.renderer.Component);


// ------------------------------
// Constants
// ------------------------------

/**
 * Для обратной совместимости.
 * @ignore
 */
DD.ui.Component.EventType = DD.ui.EventType;

/**
 * @enum {number}
  */
DD.ui.Component.State = {

  /**
   * Summa of all states.
   */
  ALL: 0xFFF,

  FOCUSED:       0x001,
  ACTIVE:        0x002,
  CHECKED:       0x004,
  SELECTED:      0x008,
  READONLY:      0x010,
  DISABLED:      0x020,
  INDETERMINATE: 0x040,
  OPENED:        0x080
};

/**
 * @enum {string}
 */
DD.ui.Component.Error = {
  NOT_A_RENDERER: 'Not a renderer instance'
};


// ------------------------------
// Prototype
// ------------------------------

goog.scope(function() {

/** @alias DD.ui.Component.prototype */
var prototype = DD.ui.Component.prototype;
var superClass_ = DD.ui.Component.superClass_;
var EventType = DD.ui.EventType;


// ------------------------------
// Properties
// ------------------------------

/**
 * Bit mask of current states.
 * @type {number}
 * @private
 */
prototype.state_ = 0;

/**
 * Bit mask of supported states.
 * @type {number}
 * @default DD.ui.Component.State.ALL
 * @private
 */
prototype.supportedStates_ = DD.ui.Component.State.ALL;

/**
 * Singleton helper for rendering DOM.
 * @type {DD.ui.renderer.Component}
 * @private
 */
prototype.renderer_ = null;

/**
 * Renderers are stateless, but sometimes they need to cache
 * calculated objects (nodes, strings, etc) to optimize.
 * @type {?Object}
 * @private
 */
prototype.rendererCache_ = null;

/**
 * Css class for all elements in a component's markup.
 * @type {string}
 * @private
 */
prototype.cssPrefix_ = '';

/**
 * Custom class which will be added to the main element.
 * @type {string}
 * @private
 */
prototype.customCssClass_ = '';

/**
 * Element id.
 * @type {string}
 * @private
 */
prototype.nodeId_ = '';

/**
 * Component visibility.
 * @type {boolean}
 * @default true
 * @private
 */
prototype.visible_ = true;

/**
 * Cover mode.
 * @type {boolean}
 * @default false
 * @private
 * @todo Провести ревизию и пересмотреть: нужен ли вообще такой режим?
 */
prototype.covered_ = false;

/**
 * Some user data. Model.
 * @type {string}
 * @private
 */
prototype.value_ = null;

/**
 * Locks count.
 * @type {number}
 * @private
 */
prototype.updateCount_ = 0;


// ------------------------------
// Methods
// ------------------------------

/**
 * @inheritdoc
 */
prototype.createDom = function() {
  this.setElementInternal(this.renderer_.createDom(this));
};

/**
 * @inheritdoc
 */
prototype.canDecorate = function(element) {
  return this.renderer_.canDecorate(element);
};

/**
 * @inheritdoc
 */
prototype.decorateInternal = function(element) {
  this.setElementInternal(this.renderer_.decorate(this, element));
};

/**
 * @inheritdoc
 */
prototype.enterDocument = function() {
  superClass_.enterDocument.call(this);
  this.renderer_.initializeDom(this);
};

/**
 * @inheritdoc
 */
prototype.exitDocument = function() {
  this.renderer_.uninitializeDom(this);
  superClass_.exitDocument.call(this);
};

/**
 * @inheritdoc
 */
prototype.disposeInternal = function() {
  this.clearRendererCache();
  superClass_.disposeInternal.call(this);
};

prototype.attach = function() {
  if (!this.getElement())
    return;
  var el = document.body;
  var parent = this.getParent();
  if (parent) {
    el = parent.getContentElement();
    if (!el)
      return;
  }
  this.attachTo(el);
};

prototype.attachTo = function(el) {
  if (!this.getElement())
    return;
  el.appendChild(this.getElement());
  this.enterDocument();
};

prototype.detach = function() {
  if (!this.getElement())
    return;
  this.exitDocument();
  goog.dom.removeNode(this.getElement());
};

//prototype.

/**
 * Sets many properties at once.
 * @param {Object} options Hash of properties like in constructor.
 * @protected
 */
prototype.assign = function(options) {

  if (!goog.isObject(options))
    return;

  if (goog.isString(options.id))
    this.setId(options.id);

  if (goog.isString(options.nodeId))
    this.setNodeId(options.nodeId);

  if (goog.isString(options.cssPrefix))
    this.setCssPrefix(options.cssPrefix);

  if (goog.isString(options.cssClass))
    this.setCustomCssClass(options.cssClass);

  if (goog.isBoolean(options.disabled))
    this.setDisabled(options.disabled);

  if (goog.isBoolean(options.readonly))
    this.setReadonly(options.readonly);

  if (goog.isBoolean(options.checked))
    this.setChecked(options.checked);

  if (goog.isBoolean(options.selected))
    this.setSelected(options.selected);

  if (goog.isBoolean(options.opened))
    this.setOpened(options.opened);

  if (goog.isBoolean(options.active))
    this.setActive(options.active);

  if (goog.isBoolean(options.focused))
    this.setFocused(options.focused);

  if (goog.isBoolean(options.indeterminate))
    this.setIndeterminate(options.indeterminate);
};

/**
 * @param {string} value
 * @public
 */
prototype.setCssPrefix = function(value) {
  this.cssPrefix_ = value.split(' ')[0];
};

/**
 * @return {string}
 * @public
 */
prototype.getCssPrefix = function(value) {
  return this.cssPrefix_;
};

/**
 * @param {string} value
 * @public
 */
prototype.setCustomCssClass = function(value) {
  this.customCssClass_ = value;
};

/**
 * @return {string}
 * @public
 */
prototype.getCustomCssClass = function() {
  return this.customCssClass_;
};

/**
 * @param {string} id
 * @public
 */
prototype.setNodeId = function(id) {
  this.setNodeIdInternal(id);
  this.renderer_.setNodeId(this, id);
};

/**
 * @param {string} id
 * @public
 */
prototype.setNodeIdInternal = function(id) {
  this.nodeId_ = id;
};

/**
 * @return {string}
 * @public
 */
prototype.getNodeId = function() {
  return this.nodeId_;
};

/**
 * Defines the element in the component's DOM,
 * which may contain the childrens. By default it's the component's element.
 * @inheritdoc
 * @param  {HTMLElement} element Element inside component's dom sctructure
 *    or the component's root element.
 * @protected
 */
prototype.setContentElement = function(element) {
  this.contentElement_ = element;
};

/**
 * Gets the container element for children.
 * @inheritdoc
 * @see {prototype.setContentElement}
 * @param {HTMLElement}
 * @public
 */
prototype.getContentElement = function() {
  return this.contentElement_ || this.getElement();
};

/**
 * Sets content.
 * @param {HTMLElement|string} content
 * @public
 * @todo А нужен ли этот метод?
 */
prototype.setContentInternal = function(content) {
  if (!this.contentElement_)
    return;
  if (typeof content === 'string')
    this.contentElement_.innerHTML = content;
  else
    this.contentElement_.appendChild(content);
};

/**
 * Удаляет текущий компонент из иерархии компонентов.
 * @public
 */
prototype.remove = function() {
  var parent = this.getParent();
  if (parent)
    parent.removeChild(this);
};

/**
 * Sets the renderer.
 * @param {DD.ui.renderer.Component} renderer Renderer instance.
 * @public
 */
prototype.setRenderer = function(renderer) {

  if (!(renderer instanceof DD.ui.renderer.Component))
    throw Error(DD.ui.Component.Error.NOT_A_RENDERER);

  // Don't change the renderer if the component is in document.
  if (this.isInDocument())
    throw Error(goog.ui.Component.Error.ALREADY_RENDERED);

  // If the component is not in document, but the element is rendered,
  // remove the old element.
  if (this.getElement())
    this.setElementInternal(null);

  this.clearRendererCache();
  this.renderer_ = renderer;
};

/**
 * Gets the renderer instance.
 * @return {?DD.ui.renderer.Component}
 * @public
 */
prototype.getRenderer = function() {
  return this.renderer_;
};

/**
 * @param {DD.ui.renderer.Component} renderer
 * @public
 */
prototype.changeRenderer = function(renderer) {

  if (renderer === this.renderer_)
    return;

  var placeholder = null;
  var wasIn = this.isInDocument();

  if (wasIn) {
    placeholder = this.getDomHelper().createDom('span');
    placeholder.style.display = 'none';
    goog.dom.replaceNode(placeholder, this.getElement());
    this.exitDocument();
  }

  this.setRenderer(renderer);
  this.createDom();

  if (wasIn) {
    goog.dom.replaceNode(this.getElement(), placeholder);
    this.enterDocument();
  }

  this.changed();
};

/**
 * Saves some value to cache.
 * @param {string} key
 * @param {*} value
 * @public
 */
prototype.setRendererCache = function(key, value) {
  this.rendererCache_ || (this.rendererCache_ = {});
  this.rendererCache_[key] = value;
};

/**
 * Gets values from cache. If there's no key specified it returns all cache.
 * @param  {string=} opt_key Имя свойства
 * @return {*|undefined|Object}
 * @public
 */
prototype.getRendererCache = function(opt_key) {
  if (!this.rendererCache_)
    return null;
  if (opt_key)
    return this.rendererCache_[opt_key];
  return this.rendererCache_;
};

/**
 * Clears the renderer cache.
 * In case we switch renderers or the component disposes.
 * @protected
 */
prototype.clearRendererCache = function() {

  // Check for disposable objects.
  var key, obj;
  for (key in this.rendererCache_) {
    obj = this.rendererCache_[key];
    if (goog.isObject(obj) && obj instanceof goog.Disposable)
      obj.dispose();
  }

  this.rendererCache_ = null;
};

/**
 * Change component state.
 * It is used by controls (buttons, checkboxes, etc.) and some other components.
 * @param {DD.ui.Component.State} state Component state.
 * @param {boolean} enabled If TRUE the state is enabled.
 * @public
 */
prototype.setState = function(state, enable) {

  // If it is already set to the desired value, then do nothing.
  if (!this.isSupportedState(state))
    return false;

  enable = !!enable;

  if (enable === this.hasState(state))
    return false;

  this.state_ = enable
    ? this.state_ | state // plus state
    : this.state_ & ~state; // minus state
  // State changing can affect the components markup.
  this.renderer_.setState(this, state, enable);
  return true;
};

/**
 * Sets the component's state to the state represented by a bit mask of
 * {@link DD.ui.Component.State}s. Unlike {@link #setState}, doesn't
 * update the component's styling, and doesn't reject unsupported states.
 * Called by renderers during element decoration. Considered protected;
 * should only be used within this package and by subclasses.
 * This should only be used by subclasses and its associated renderers.
 *
 * @param {number} state Bit mask representing component state.
 * @public
 */
prototype.setStatesInternal = function(states) {
  this.state_ = states;
};

/**
 * Returns the component current states.
 * @return {number} Bit mask.
 * @protected
 */
prototype.getState = function() {
  return this.state_;
};

/**
 * Checks one of the component states.
 * @param  {DD.ui.Component.State} state Checked state.
 * @return {boolean}
 * @public
 */
prototype.hasState = function(state) {
  return !!(this.state_ & state);
};

/**
 * Enables or disables support for the given state.
 * @param {goog.ui.Component.State} state State to support or de-support.
 * @param {boolean} support Whether the component should support the state.
 * @public
 */
prototype.setSupportedState = function(state, support) {

  if (!support && this.hasState(state))
    this.setState(state, false);

  this.supportedStates_ = support
    ? this.supportedStates_ | state
    : this.supportedStates_ & ~state;
};

/**
 * Returns TRUE if the component supports the specified state, FALSE otherwise.
 * @param {DD.ui.Component.State} state State to check.
 * @return {boolean} Whether the component supports the given state.
 * @public
 */
prototype.isSupportedState = function(state) {
  return !!(this.supportedStates_ & state);
};

/**
 * Sets state FOCUSED.
 * @param {boolean} focused
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setFocused = function(focused) {
  return this.setState(DD.ui.Component.State.FOCUSED, focused);
};

/**
 * Checks if the component is focused.
 * @return {Boolean}
 * @public
 */
prototype.isFocused = function() {
  return this.hasState(DD.ui.Component.State.FOCUSED);
};

/**
 * Sets state ACTIVE.
 * @param {boolean} active
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setActive = function(active) {
  return this.setState(DD.ui.Component.State.ACTIVE, active);
};

/**
 * Checks if the component is active.
 * @return {boolean}
 * @public
 */
prototype.isActive = function() {
  return this.hasState(DD.ui.Component.State.ACTIVE);
};

/**
 * Sets state CHECKED.
 * @param {boolean} checked
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setChecked = function(checked) {
  var success = this.setState(DD.ui.Component.State.CHECKED, checked);
  if (success)
    this.dispatchEvent(DD.ui.EventType.CHECK);
  return success;
};

/**
 * Checks if the component is checked.
 * @return {boolean}
 * @public
 */
prototype.isChecked = function() {
  return this.hasState(DD.ui.Component.State.CHECKED);
};

/**
 * Sets state SELECTED.
 * @param {boolean} selected
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setSelected = function(selected) {
  var success = this.setState(DD.ui.Component.State.SELECTED, selected);
  if (success)
    this.dispatchEvent(DD.ui.EventType.SELECT);
  return success;
};

/**
 * Checks if the component is selected.
 * @return {boolean}
 * @public
 */
prototype.isSelected = function() {
  return this.hasState(DD.ui.Component.State.SELECTED);
};

/**
 * Sets state READONLY.
 * @param {boolean} readonly
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setReadonly = function(readonly) {
  return this.setState(DD.ui.Component.State.READONLY, readonly);
};

/**
 * Checks if the component is readonly.
 * @return {boolean}
 * @public
 */
prototype.isReadonly = function() {
  return this.hasState(DD.ui.Component.State.READONLY);
};

/**
 * Sets state DISABLED.
 * @param {boolean} disabled
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setDisabled = function(disabled) {
  return this.setState(DD.ui.Component.State.DISABLED, disabled);
};

/**
 * Checks if the component is disabled.
 * @return {boolean}
 * @public
 */
prototype.isDisabled = function() {
  return this.hasState(DD.ui.Component.State.DISABLED);
};

/**
 * Sets state INDETERMINATE.
 * @param {boolean} indeterminate
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setIndeterminate = function(indeterminate) {
  return this.setState(DD.ui.Component.State.INDETERMINATE, indeterminate);
};

/**
 * Checks if the component is indeterminate.
 * @return {boolean}
 * @public
 */
prototype.isIndeterminate = function() {
  return this.hasState(DD.ui.Component.State.INDETERMINATE);
};

/**
 * Sets state OPENED.
 * @param {boolean} opened
 * @return {boolean} FALSE if the state is unsupported.
 * @public
 */
prototype.setOpened = function(opened) {
  return this.setState(DD.ui.Component.State.OPENED, opened);
};

/**
 * Checks if the component is indeterminate.
 * @return {boolean}
 * @public
 */
prototype.isOpened = function() {
  return this.hasState(DD.ui.Component.State.OPENED);
};

/**
 * Changes the state COVERED value.
 * @param {boolean} enabled
 * @public
 */
prototype.setCovered = function(enabled) {
  enabled = !!enabled;
  this.covered_ = enabled;
  this.renderer_.setCovered(this, enabled);
};

/**
 * Checks if the component is covered.
 * @return {boolean}
 * @public
 */
prototype.isCovered = function() {
  return this.covered_;
};

/**
 * Defines the viewport of the component. Viewport is relative to the document.
 * Original idea was that out of the viewport
 * the component's children become COVERED to optimize.
 * @param {Object.<number>} viewport
 *    Relative to the document coordinates of viewport.
 * @param {number} viewport.left
 * @param {number} viewport.right
 * @param {number} viewport.top
 * @param {number} viewport.bottom
 * @public
 * @todo А нужен ли такой функционал? Востребован ли он сейчас?
 */
prototype.coverOuterArea = function(viewport) {
  this.renderer_.coverOuterArea(this, viewport);
};

/**
 * Checks if the component is visible.
 * @return {boolean}
 * @public
 */
prototype.isVisible = function() {
  return this.visible_;
};

/**
 * Facade for show and hide methods.
 * @public
 */
prototype.setVisible = function(visible) {
  visible ? this.show() : this.hide();
};

/**
 * Sets the value.
 * @param {string} value
 * @public
 */
prototype.setValue = function(value) {

  if (value === this.value_)
    return;

  this.setValueInternal(value);

  var renderer = this.getRenderer();
  if (renderer.setValue)
    renderer.setValue(this, value);

  this.valueChanged();
  this.changed();
};

/**
 * Sets the value without triggering events and rerendering.
 * Must be used only by renderers.
 * @public
 */
prototype.setValueInternal = function(value) {
  this.value_ = value;
};

/**
 * Returns the value.
 * @return {string}
 * @public
 */
prototype.getValue = function() {
  return this.value_;
};

/**
 * Shows the component.
 * Triggers BEFORE_SHOW for animated openning.
 * @param {boolean=} opt_force Fast or animated?
 * @param {HTMLElement=} opt_element The component will be rendered
 *    after this element.
 * @public
 * @todo What's the "opt_element"?
 */
prototype.show = function(opt_force, opt_element) {

  if (this.visible_)
    return;
  this.visible_ = true;

  if (opt_force === undefined)
    opt_force = true;

  if (!opt_force) {
    this.dispatchEvent({
      type: EventType.BEFORE_SHOW,
      element: opt_element
    });
  }

  this.renderer_.show(this, opt_force, opt_element);

  if (opt_force)
    this.changed();
};

/**
 * Triggers AFTER_SHOW for animated openning.
 * @param {boolean=} opt_force Fast or animated?
 * @public
 */
prototype.handleShow = function(opt_force) {

  if (opt_force === undefined)
    opt_force = true;

  if (!opt_force) {
    this.dispatchEvent(EventType.AFTER_SHOW);
    this.changed();
  }
};

/**
 * Hides the component.
 * Triggers BEFORE_HIDE for animated hiding.
 * @param {boolean=} opt_force Fast or animated?
 * @public
 */
prototype.hide = function(opt_force) {

  if (opt_force === undefined)
    opt_force = true;

  if (!this.visible_)
    return;
  this.visible_ = false;

  if (!opt_force) {
    this.dispatchEvent(EventType.BEFORE_HIDE);
  }

  this.renderer_.hide(this, opt_force);

  if (opt_force)
    this.changed();
};

/**
 * Triggers AFTER_HIDE for animated hiding.
 * @param {boolean=} opt_force Fast or animated?
 * @public
 */
prototype.handleHide = function(opt_force) {

  if (opt_force === undefined)
    opt_force = true;

  this.visible_ = false;
  if (!opt_force) {
    this.dispatchEvent(EventType.AFTER_HIDE);
    this.changed();
  }
};

/**
 * Resizes the component and its children.
 * First - children, then - self!
 * @todo Почему так: "first - children, then - self"?
 * @public
 */
prototype.resize = function() {

  if (!this.isInDocument())
    return;

  this.renderer_.resize && this.renderer_.resize(this);
};

/**
 * Locks event dispatching and rerendering until endUpdate call.
 * @public
 */
prototype.beginUpdate = function() {
  this.updateCount_++;
};

/**
 * Unlocks event dispatching and rerendering. If opt_forceUpdate set to FALSE,
 * then no events dispatch on unlock. It may be very useful.
 * @param {boolean=} [opt_forceUpdate=TRUE]
 * @public
 */
prototype.endUpdate = function(opt_forceUpdate) {
  this.updateCount_--;
  if (this.updateCount_ === 0 && opt_forceUpdate !== false) {
    this.update();
  }
};

/**
 * Returns depths of locks.
 * @return {number}
 * @public
 */
prototype.getUpdateCount = function() {
  return this.updateCount_;
};

/**
 * Checks component for locks.
 * @return {boolean}
 * @public
 */
prototype.canUpdate = function() {
  return !this.updateCount_;
};

/**
 * Triggers CHANGE event if it is not locked by beginUpdate.
 * Left for backward compatibility with DD.ui.List 1.0.
 * Use method "changed" instead.
 * @todo Remove this.
 * @public
 * @deprecated
 */
prototype.update = function() {
  this.changed();
};

/**
 * Triggers CHANGE event if it is not locked by beginUpdate.
 * @public
 */
prototype.changed = function() {
  if (!this.isInDocument())
    return;
  if (!this.canUpdate())
    return;
  this.dispatchEvent(EventType.CHANGE);
};

/**
 * Triggers VALUE_CHANGED event.
 * @public
 */
prototype.valueChanged = function() {
  this.dispatchEvent(EventType.VALUE_CHANGED);
};


// ------------------------------
// Facade
// ------------------------------

/**
 * Shortcut to set or get renderer cache.
 * @param {string} key Key in hash.
 * @param {*=} opt_value Value to be set by key.
 * @return {*=} Value by key.
 * @public
 */
prototype.$cache = function() {
  if (arguments.length > 1)
    this.setRendererCache.apply(this, arguments);
  else
    return this.getRendererCache.apply(this, arguments);
};

}); // goog.scope
