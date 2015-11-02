/**
 * @overview Component renderer.
 * @project UI.
 * @author Anna Agte
 * @version 1.1
 */

goog.provide('DD.ui.renderer.Component');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.style');


// ------------------------------
// Constructor
// ------------------------------

/**
 * @constructor
 */
DD.ui.renderer.Component = function() {
};
goog.addSingletonGetter(DD.ui.renderer.Component);


// ------------------------------
// Constants
// ------------------------------

/**
 * Base CSS class for rendering.
 * Override this in descendants.
 * @type {string} 
 */
DD.ui.renderer.Component.CSS_CLASS = 'DD-component';


// ------------------------------
// Static methods
// ------------------------------

/**
 * Factory. Returns new renderer with a given base CSS class. 
 * @param {DD.ui.renderer.Component} baseRenderer Base renderer class.
 * @param {string} cssClassName New base CSS class.
 * @return {DD.ui.renderer.Component}
 * @public
 */
DD.ui.renderer.Component.getCustomRenderer = function(baseRenderer, cssClass) {
  var renderer = new baseRenderer();
  renderer.getCssClass = function() {
    return cssClass;
  };
  return renderer;
};


// ------------------------------
// Prototype
// ------------------------------

goog.scope(function() {

/** @alias DD.ui.renderer.Component */
var prototype = DD.ui.renderer.Component.prototype;


// ------------------------------
// Properties
// ------------------------------

/**
 * Tag name of the component's root element.
 * @type {string}
 * @protected
 */
prototype.tagName = 'div';


// ------------------------------
// Methods
// ------------------------------

/**
 * Returns the base CSS class for rendering.
 * @return {string}
 * @protected
 */
prototype.getCssClass = function() {
  return DD.ui.renderer.Component.CSS_CLASS;
};

/**
 * Returns a BEM classname.
 * @param {string=} elClass
 * @param {string=} modClass
 * @return {string}
 * @protected
 */
prototype.getBEMClass = function(component, elClass, modClass) {
  var prefix = component.getCssPrefix() || this.getCssClass();
  if (!elClass)
    return prefix;
  if (!modClass)
    return prefix + '__' + elClass;
  return prefix + '__' + elClass + '_' + modClass;
};

/**
 * Main rendering method. Invoked from Component::createDom.
 * @param {DD.ui.Component} component
 * @return {HTMLElement}
 * @public
 */
prototype.createDom = function(component) {

  var dom = component.getDomHelper();
  var classes = this.getClasses(component);
  var customClass = component.getCustomCssClass();
  if (customClass)
    classes.push(customClass);

  var element = dom.createDom(this.tagName, classes.join(' '));
  component.$cache('root', element);
  this.setNodeId(component, component.getNodeId());
  component.setContentElement(element);
  return element;
};

/**
 * Basic decorate method.
 * @param {DD.ui.Component}
 * @param {HTMLElement} element Container node.
 * @return {HTMLElement}
 * @public
 */
prototype.decorate = function(component, element) {

  // If node has ID, set it to the component unique id.
  if (element.id)
    component.setNodeIdInternal(element.id);

  // Turn classes into states.
  var states = this.getStates(element);
  component.setStatesInternal(states);

  goog.dom.classes.add(element, this.getBEMClass(component));
  var customClass = component.getCustomCssClass();
  if (customClass)
    goog.dom.classes.add(element, customClass);

  component.$cache('root', element);
  component.setContentElement(element);
  return element;
};

/**
 * Can an element be decorated. By default DIV => TRUE, other - FALSE.
 * Override this in descendants if needed.
 * @param {HTMLElement} element Node which we want to decorate.
 * @return {boolean}
 * @public
 */
prototype.canDecorate = function(element) {
  return goog.dom.canHaveChildren(element);
};

/**
 * @param {DD.ui.Component}
 * @param {string} id
 * @public
 */
prototype.setNodeId = function(component, id) {
  if (!id)
    return;
  var element = component.$cache('root');
  if (!element)
    return;
  element.id = id;
};

/**
 * Add all event handlers here.
 * Override this in descendants. 
 * @param {DD.ui.Component} component
 * @public
 */
prototype.initializeDom = function(component) {

  this.setStates(component);

  if (!component.isVisible())
    component.getElement().style.display = 'none';

  var eventHandler = new goog.events.EventHandler();
  component.$cache('eventHandler', eventHandler);
};

/**
 * Remove all event handlers here.
 * Override this in descendants. 
 * @param {DD.ui.Component} component
 * @public
 */
prototype.uninitializeDom = function(component) {

  var eventHandler = component.$cache('eventHandler');
  if (eventHandler)
    eventHandler.dispose();
};

/**
 * Shows the component.
 * @param {DD.ui.Component} component
 * @param {boolean=} opt_force Don't use animation and show it fast.
 * @public
 */
prototype.show = function(component, opt_force) {

  var element = component.getElement();
  if (!element)
    return;

  element.style.display = '';
  component.handleShow(opt_force);
};
 
/**
 * Hides the component.
 * @param {DD.ui.Component} component
 * @param {boolean=} opt_force Don't use animation and hide it fast.
 * @public
 */
prototype.hide = function(component, opt_force) {

  var element = component.getElement();
  if (!element)
    return;

  element.style.display = 'none';
  component.handleHide(opt_force);
};

/**
 * Updates markup according to the new state value.
 * @param {DD.ui.Component} component
 * @param {DD.ui.Component.State} state
 * @param {boolean} enabled
 * @public
 */
prototype.setState = function(component, state, enabled) {

  var element = component.$cache('root') || component.getElement();
  if (!element)
    return;

  var className = this.getClassByState(state);
  if (className)
    goog.dom.classes.enable(element, className, enabled);

  switch (state) {

    case DD.ui.Component.State.FOCUSED:
      this.setFocused(component, enabled);
      break;

    case DD.ui.Component.State.CHECKED:
      this.setChecked(component, enabled);
      break;

    case DD.ui.Component.State.SELECTED:
      this.setSelected(component, enabled);
      break;

    case DD.ui.Component.State.OPENED:
      this.setOpened(component, enabled);
      break;

    case DD.ui.Component.State.DISABLED:
      this.setDisabled(component, enabled);
      break;

    case DD.ui.Component.State.READONLY:
      this.setReadonly(component, enabled);
      break;

    case DD.ui.Component.State.ACTIVE:
      this.setActive(component, enabled);
      break;

    case DD.ui.Component.State.INDETERMINATE:
      this.setIndeterminate(component, enabled);
      break;
  }
};

/**
 * Render all active states.
 * @param {DD.ui.Component} component
 * @protected
 */
prototype.setStates = function(component) {
  var state, states = component.getState();
  while (states) {
    state = states & -states; // Least significant bit
    this.setState(component, state, true);
    states &= ~state;
  }
};

/**
 * Override this in descendants.
 * @param {DD.ui.Component} component
 * @param {boolean} enabled
 * @protected
 */
prototype.setFocused = function(component, enabled) {
};

/**
 * Override this in descendants.
 * @param {DD.ui.Component} component
 * @param {boolean} enabled
 * @protected
 */
prototype.setActive = function(component, enabled) {
};

/**
 * Override this in descendants.
 * @param {DD.ui.Component} component
 * @param {boolean} enabled
 * @protected
 */
prototype.setChecked = function(component, enabled) {
};

/**
 * Override this in descendants.
 * @param {DD.ui.Component} component
 * @param {boolean} enabled
 * @protected
 */
prototype.setSelected = function(component, enabled) {
};

/**
 * Override this in descendants.
 * @param {DD.ui.Component} component
 * @param {boolean} enabled
 * @protected
 */
prototype.setReadonly = function(component, enabled) {
};

/**
 * Override this in descendants.
 * @param {DD.ui.Component} component
 * @param {boolean} value
 * @protected
 */
prototype.setDisabled = function(component, value) {
};

/**
 * Override this in descendants.
 * @param {DD.ui.Component} component
 * @param {boolean} enabled
 * @protected
 */
prototype.setIndeterminate = function(component, enabled) {
};

/**
 * Override this in descendants.
 * @param {DD.ui.Component} component
 * @param {boolean} enabled
 * @protected
 */
prototype.setOpened = function(component, enabled) {
};

/**
 * Add or remove the cover.
 * @param {DD.ui.Component} component
 * @param {boolean} enabled
 * @Public
 */
prototype.setCovered = function(component, enabled) {

  var element = component.getElement();
  if (!element)
    return;

  var cover = this.getCover(component);

  if (enabled) {
    var H = '';
    var W = '';
    if (goog.style.getComputedStyle(element, 'box-sizing') == 'border-box') {
      H = element.clientHeight + 'px';
      W = element.clientWidth + 'px';
    } else {
      H = goog.style.getComputedStyle(element, 'height');
      W = goog.style.getComputedStyle(element, 'width');
    }
    cover.style.width = W;
    cover.style.height = H;
    cover.style.marginTop = element.marginTop;
    cover.style.marginBottom = element.marginBottom;
    cover.style.marginLeft = element.marginLeft;
    cover.style.marginRight = element.marginRight;
    cover.style.position = element.style.position;
    cover.style.top = element.style.top;
    cover.style.bottom = element.style.bottom;
    cover.style.left = element.style.left;
    cover.style.right = element.style.right;
    goog.dom.replaceNode(cover, element);

  } else {
    goog.dom.replaceNode(element, cover);
    cover.style.width = '';
    cover.style.height = '';
  }
}

/**
 * Creates a cover for the component.
 * @param {DD.ui.Component} component
 * @public
 */
prototype.getCover = function(component) {

  var cover = component.$cache('cover');
  if (!cover) {
    var cssClass = this.getBEMClass(component, 'cover');
    cover = component.getDomHelper().createDom('div', cssClass);
    component.$cache('cover', cover);
  }

  return cover;
};

/**
 * Defines the viewport of the component. Viewport is relative to the document.
 * Out of the viewport the component's children become COVERED to optimize.
 * @param {DD.ui.Component} component
 * @param {Object.<number>} viewport
 *    Relative to the document coordinates of viewport.
 * @param {number} viewport.left
 * @param {number} viewport.right
 * @param {number} viewport.top
 * @param {number} viewport.bottom
 * @public
 */
prototype.coverOuterArea = function(component, viewport) {

  if (!viewport || !component.isInDocument())
    return;

  var el = component.isCovered()
    ? this.getCover(component)
    : component.getElement();

  var offset = goog.style.getPageOffset(el);
  var this_coords = {
    left: offset.x,
    top: offset.y,
    right: offset.x + el.offsetWidth,
    bottom: offset.y + el.offsetHeight
  };

  // If the component is absolutely out of the viewport, then cover it.
  if (this_coords.bottom < viewport.top || this_coords.top > viewport.bottom) {
    if (!component.isCovered()) {
      component.setCovered(true);
    }
  }

  // In other cases delegate this task to the component's children.
  else {
    if (component.isCovered()) {
      component.setCovered(false);
    }
    component.forEachChild(function(child){
      if (child.isInDocument()) {
        child.coverOuterArea(viewport);
      }
    });
  }
};

/**
 * Gets classes by component's state.
 * @param {DD.ui.Component} component
 * @return {Array.<string>}
 * @protected
 */
prototype.getClasses = function(component) {

  var baseClass = this.getBEMClass(component);
  var classNames = [baseClass];
  var classNamesForState = [];
  var states = component.getState();
  var state;

  while (states) {
    state = states & -states; // Least significant bit
    className = this.getClassByState(state);
    if (className)
      classNames.push(className);
    states &= ~state;
  }

  return classNames;
};

/**
 * Gets states by element's classes.
 * @param {HTMLElement} element
 * @return {Array.<DD.ui.Component.State>}
 * @private
 */
prototype.getStates = function(element) {

  var baseClass = this.getCssClass();
  var hasBaseClass = false;
  var states = 0;

  var classNames = goog.dom.classes.get(element);
  if (classNames) {
    goog.array.forEach(classNames, function(className) {

      if (className === baseClass) {
        hasBaseClass = true;
        return;
      }

      if (className) {
        parsedState = parseInt(this.getStateByClass(className), 10);
        parsedState = isNaN(parsedState) ? 0 : parsedState;
        if (parsedState)
          states |= parsedState;
        return;
      }
    }, this);
  }
  return states;
}

/**
 * @param {DD.ui.Component.State} state
 * @protected
 */
prototype.getClassByState = function(state) {
  return this.getAllClasses_()[state];
};

/**
 * @param {string} className
 * @protected
 */
prototype.getStateByClass = function(className) {
  return this.getAllStates_()[className];
};

// Создаем массив констант при первом запросе,
// а не в прототипе и даже не в конструкторе,
// потому что рендерер должен грузиться до компонента
// и на момент описания прототипа рендерера и вызова конструктора
// компонент еще не подгружен.

/**
 * @return {Array.<DD.ui.Component.State, string>}
 * @private
 */
prototype.getAllClasses_ = function() {

  if (!this.classes_) {
    this.classes_ = {};
    this.classes_[DD.ui.Component.State.FOCUSED] ='focused';
    this.classes_[DD.ui.Component.State.ACTIVE] = 'active';
    this.classes_[DD.ui.Component.State.CHECKED] = 'checked';
    this.classes_[DD.ui.Component.State.SELECTED] = 'selected';
    this.classes_[DD.ui.Component.State.READONLY] = 'readonly';
    this.classes_[DD.ui.Component.State.DISABLED] = 'disabled';
    this.classes_[DD.ui.Component.State.OPENED] = 'opened';
    this.classes_[DD.ui.Component.State.INDETERMINATE] = 'indeterminate';
  }

  return this.classes_;
};

/**
 * @type {Array.<string, number>}
 * @private
 */
prototype.getAllStates_ = function() {

  if (!this.states_) {
    this.states_ = goog.object.transpose(this.classes_);
  }

  return this.states_;
};

}); // goog.scope
