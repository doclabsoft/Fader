/**
 * Base list component. Simple interface. Sortable.
 * @project UI.
 * @author Anna Agte
 * @version 1.1
 */

goog.provide('DD.ui.List');

goog.require('DD.ui.Component');
goog.require('DD.ui.renderer.List');
goog.require('DD.ui.EventType');
goog.require('goog.ui.registry');
goog.require('goog.events.Event');
goog.require('goog.array');


// ------------------------------
// Constructor
// ------------------------------

/**
 * @param {Object|goog.dom.DomHelper=} arg
 * @constructor
 * @extends DD.ui.Component
 */
DD.ui.List = function(arg) {

  this.orderedKeys_ = [];
  this.orderedKeysDefault_ = [];
  this.deletedItems_ = [];
  this.selectedItems_ = [];
  this.checkedItems_ = [];

  DD.ui.Component.call(this, arg);
};
goog.inherits(DD.ui.List, DD.ui.Component);
goog.ui.registry.setDefaultRenderer(DD.ui.List, DD.ui.renderer.List);


// ------------------------------
// Constants
// ------------------------------

/**
 * @enum {string}
 */
DD.ui.List.EventType = {

  /**
   * Triggers when a part of items is rendered.
   * This process can be stopped, if event will be stopped.
   * @todo Может, уже не нужно?
   */
  PART_RENDERED: 'list__partially_rendered'
};


// ------------------------------
// Prototype
// ------------------------------

goog.scope(function() {

/** @alias DD.ui.List.prototype */
var prototype = DD.ui.List.prototype;
var superClass_ = DD.ui.List.superClass_;
var PART_RENDERED = DD.ui.List.EventType.PART_RENDERED;


// ------------------------------
// Properties
// ------------------------------

/**
 * Unsorted items' ids.
 * @type {Array.<string>}
 * @private
 */
prototype.orderedKeysDefault_ = null;

/**
 * Sorted items' ids.
 * @type {Array.<string>}
 * @private
 */
prototype.orderedKeys_ = null;



/**
 * Deleted items before they are vanished.
 * @type {Array.<DD.ui.Component>}
 * @private
 */
prototype.deletedItems_ = null;

/**
 * Indicator of ctructure changes.
 * @type  {boolean}
 * @default
 * @private
 */
prototype.colectionChanged_ = false;

/**
 * @type {Array.<DD.ui.Component>}
 * @private
 */
prototype.selectedItems_ = null;

/**
 * @type {Array.<DD.ui.Component>}
 * @private
 */
prototype.checkedItems_ = null;


// ------------------------------
// Methods
// ------------------------------

/**
 * @inheritdoc
 */
prototype.enterDocument = function() {

  if (this.isInDocument())
    return; 

  this.renderPart_(0, 50);

  var handler = this.getHandler();
  handler.listen(this, DD.ui.EventType.SELECT, this.onSelect_.bind(this));
  handler.listen(this, DD.ui.EventType.CHECK, this.onCheck_.bind(this));

  superClass_.enterDocument.call(this);
}

/**
 * @inheritdoc
 */
prototype.exitDocument = function() {

  if (!this.isInDocument())
    return;

  this.forEach(function(item){
    item.detach();
  }, this);

  superClass_.exitDocument.call(this);
}

/**
 * Partial rendering. Triggers event PART_RENDERED.
 * Renders until the event is stopped.
 * @param {number} start Index of a first element, which will be rendered.
 * @param {number} count Number of items, that will be rendered. 
 * @private
 */
prototype.renderPart_ = function(start, count) {

  var max = this.getCount();
  if (start < 0 || start >= max)
    return;

  var finish = Math.min(start + count, max);
  var container = this.getContentElement();
  var item = null;
  for (var i=start; i<finish; i++) {
    item = this.getChild(this.orderedKeys_[i]);
    item.render(container);
  }

  var success = this.dispatchEvent(PART_RENDERED);
  if (success !== false && finish < max)
    this.renderPart_(finish, count);
}

/**
 * Gets an item by its index in the sorted list.
 * @override
 * @param {number} index
 * @return {?DD.ui.Component}
 * @public
 */
prototype.getByIndex = function(index) {
  return this.getChild(this.orderedKeys_[index]) || null;
};

/**
 * Gets an item's index in the sorted list.
 * @param {DD.ui.Component} item 
 * @return {number} If fail it returns -1.
 * @public
 */
prototype.getIndexOf = function(item) {

  var id = item.getId();
  if (!this.getChild(id))
    return -1;

  for (var i=0; i<this.orderedKeys_.length; i++)
    if (this.orderedKeys_[i] == id)
      return i;
};

/**
 * Adds an item to the list.
 * @param {DD.ui.Component} item
 * @param {number=} index Where to insert the item.
 *    By default item will be added to the end.
 * @public
 */
prototype.add = function(item, index) {

  if (!(item instanceof DD.ui.Component))
    return;

  this.addChild(item, false);

  var max = this.getChildCount();
  if (index === undefined) {
    index = max;
  } else {
    index = +index;
    if (index < 0 || index > max)
      index = max;
  }

  this.orderedKeys_.splice(index, 0, item.getId());
  this.orderedKeysDefault_.splice(index, 0, item.getId());

  this.colectionChanged_ = true;
  this.update();
};

/**
 * Removes an item from the list.
 * @param {DD.ui.Component|number} item Item or item's index.
 * @param {boolean=} [opt_dispose=false]
 * @return {?DD.ui.Component}
 * @public
 */
prototype.remove = function(item, opt_dispose) {

  var index;
  if (!isNaN(item)) {
    index = item;
    item = this.getByIndex(index);
  } else if (item instanceof DD.ui.Component) {
    index = this.getIndexOf(item);
  } else {
    return;
  }

  var deletedItem = this.removeChild(item);
  if (!deletedItem)
    return null;

  this.deletedItems_.push(deletedItem);
  this.orderedKeys_.splice(index, 1);
  this.orderedKeysDefault_.splice(this.orderedKeysDefault_.indexOf(item.getId()), 1);

  this.colectionChanged_ = true;
  this.update();

  if (opt_dispose === true)
    deletedItem.dispose();

  return deletedItem;
};

/**
 * Removes all items from the list. Returns an array of the removed items.
 * @param {boolean=} [opt_dispose=false]
 * @return {Array.<DD.ui.Component>}
 * @public
 */
prototype.clear = function(opt_dispose) {

  var deletedItems = this.removeChildren();
  if (deletedItems.length === 0)
    return;

  this.orderedKeys_ = [];
  this.deletedItems_ = this.deletedItems_.concat(deletedItems);

  this.colectionChanged_ = true;
  this.update();

  if (opt_dispose === true)
    goog.disposeAll(deletedItems);

  return deletedItems;
};

/**
 * Moves an item.
 * @param {DD.ui.Component|number} from An item or an item's index.
 * @param {number} to Destination index.
 * @public
 */
prototype.move = function(from, to) {

  var indexFrom = -1, indexTo = -1, item = null;
  if (!isNaN(from)) {
    indexFrom = +from;
    item = this.getByIndex(indexFrom);
  } else if (from instanceof DD.ui.Component) {
    item = from;
    indexFrom = this.getIndexOf(item);
  } else {
    return;
  }

  if (!item || indexFrom ==- 1)
    return;

  indexTo = to;
  if (indexTo < 0 || indexTo > this.getChildCount() || indexTo === indexFrom)
    return;

  /** @todo use goog.array instead */
  this.orderedKeys_.splice(indexFrom, 1);
  this.orderedKeys_.splice(indexTo, 0, item.getId());

  this.colectionChanged_ = true;
  this.update();
};

/**
 * Gets number of items in the list.
 * @return {number}
 * @public
 */
prototype.getCount = function() {
  return this.getChildCount();
};

/**
 * Sorts items in the list.
 * @param {Function} compareHandler
 *    Обработчик сравнения двух элементов списка.
 *    Должен иметь вид function(item1, item2)
 *    и возвращать 1, если элементы расположен в обратном порядке,
 *    и -1 - если элементы расположены в правильном порядке,
 *    и 0 - если элементы равны.
 * @param {Object} scope Context to run the handler in.
 *    By default it's the list component.
 * @public
 */
prototype.sort = function(compareHandler, scope) {

  if (typeof compareHandler != 'function')
    return;

  scope = scope || this;
  this.orderedKeys_ = this.orderedKeys_.sort(function(a, b){
    var A = this.getChild(a);
    var B = this.getChild(b);
    return compareHandler.apply(scope, [A, B]);
  }.bind(this));

  this.colectionChanged_ = true;
  this.update();
};

/**
 * Reset sorting to default order.
 * @public
 */
prototype.sortReset = function() {
  this.orderedKeys_ = goog.array.clone(this.orderedKeysDefault_);
  this.colectionChanged_ = true;
  this.update();
};

/**
 * Walk through the sorted list.
 * @param {Function} handler
 * @param {Object} scope
 * @public
 */
prototype.forEach = function(handler, scope) {

  if (typeof handler != 'function')
    return false;

  scope = scope || this;
  var keys = goog.array.clone(this.orderedKeys_);

  var i, item, result;
  for (i=0; i<keys.length; i++) {
    item = this.getChild(keys[i]);
    result = handler.call(scope, item);
    if (result === false)
      break;
  }
};

/**
 * @inheritdoc
 */
prototype.update = function() {

  if (!this.canUpdate())
    return;

  this.clearDeleted_();

  if (this.colectionChanged_) {
    if (this.isInDocument())
      this.reorderChildren_();
    else
      this.exitChildren_();
  }

  this.colectionChanged_ = false;
  this.changed();
};

/**
 * @private
 */
prototype.clearDeleted_ = function() {
  var item = null;
  for (var i=0; i<this.deletedItems_.length; i++) {
    item = this.deletedItems_[i];
    this.deselect(item);
    item.exitDocument();
    if (item.element_)
      goog.dom.removeNode(item.element_);
  }
  this.deletedItems_ = [];
};

/**
 * @private
 */
prototype.exitChildren_ = function() {
  this.forEach(function(item){
    var element = item.getElement();
    if (item.isInDocument())
      item.exitDocument();
    if (element && element.parentNode && element.parentNode.nodeType == goog.dom.NodeType.ELEMENT)
      goog.dom.removeNode(element);
  }, this);
};

/**
 * @private
 */
prototype.reorderChildren_ = function() {

  var content = this.getContentElement();
  this.forEach(function(item){

    var element = item.getElement();
    if (item.isInDocument() && element)
      goog.dom.removeNode(element);

    if (!element) {
      item.createDom();
      element = item.getElement();
    }

    goog.dom.appendChild(content, element);
    if (!item.isInDocument())
      item.enterDocument();
  });
};

/**
 * Selects one of the items.
 * @param {number|DD.ui.Component} item Item or its index.
 * @public
 */
prototype.select = function(item) {
  if (goog.isNumber(item))
    item = this.getByIndex(item);
  if (!item)
    return;
  if (item.isSelected())
    return;
  this.selectedItems_.push(item);
  item.setSelected(true);
};

/**
 * Deselects one of the items.
 * @param {number|DD.ui.Component} item Item or its index.
 * @public
 */
prototype.deselect = function(item) {
  if (goog.isNumber(item))
    item = this.getByIndex(item);
  if (!item)
    return;
  if (!item.isSelected())
    return;
  goog.array.remove(this.selectedItems_, item);
  item.setSelected(false);
};

/**
 * @public
 */
prototype.deselectAll = function() {
  if (!this.selectedItems_.length)
    return;
  for (var i=0; i<this.selectedItems_.length; i++)
    this.deselect(this.selectedItems_[i]);
};

/**
 * @return {?DD.ui.Component}
 * @public
 */
prototype.getSelected = function() {
  return this.selectedItems_.length ? this.selectedItems_[0] : null;
};

/**
 * @return {Array.<DD.ui.Component>}
 * @public
 */
prototype.getSelectedAll = function() {
  return this.selectedItems_;
};

/**
 * @return {?DD.ui.Component}
 * @public
 */
prototype.getChecked = function() {
  return this.checkedItems_.length ? this.checkedItems_[0] : null;
};

/**
 * @return {Array.<DD.ui.Component>}
 * @public
 */
prototype.getCheckedAll = function() {
  return this.checkedItems_;
};

/**
 * @public
 */
prototype.selectAll = function() {
  this.forEach(function(item) {
    item.setSelected(true);
  });
};

/**
 * @public
 */
prototype.checkAll = function() {
  this.forEach(function(item) {
    item.setChecked(true);
  });
};

prototype.onSelect_ = function(event) {
  if (event.target.getParent() !== this)
    return;
  this.selectedItems_.push(event.target);
};

prototype.onDeselect_ = function(event) {
  if (event.target.getParent() !== this)
    return;
  goog.array.remove(this.selectedItems_, event.target);
};

prototype.onCheck_ = function(event) {
  if (event.target.getParent() !== this)
    return;
  this.checkedItems_.push(event.target);
};

prototype.onUncheck_ = function(event) {
  if (event.target.getParent() !== this)
    return;
  goog.array.remove(this.checkedItems_, event.target);
};

}); // goog.scope
