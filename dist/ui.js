/**
 * @project UI.
 * @author Anna Agte
 * @version 2.0
 */

/**
 * @namespace DD.ui
 */

goog.provide('DD.ui');
goog.provide('DD.ui.EventType');

/**
 * Component most used events.
 * @enum {string}
 */
DD.ui.EventType = {

  /**
   * Dispatched after the user activates the component.
   * Used for button clicks or checkbox checks
   * or another important user actions.
   */
  ACTION: 'action',

  /** Triggers right before the element is shown. */
  BEFORE_SHOW: 'beforeShow',

  /** Triggers right before the element is hidden. */
  BEFORE_HIDE: 'beforeHide',

  /** Triggers after the element is shown. */
  AFTER_SHOW: 'afterShow',

  /** Triggers after the element is hidden. */
  AFTER_HIDE: 'afterHide',

  /** Triggers right after the element is expanded. */
  OPEN: 'afterOpen',

  /** Triggers right after the element is collapsed. */
  CLOSE: 'afterClose',

  /** Triggers when something is changed. */
  CHANGE: 'change',

  /** Triggers when value is changed. */
  VALUE_CHANGED: 'value_changed',

  /** Triggers on checkbox and radiobutton click. */
  CHECK: 'check',

  /** Triggers when an item becomes selected. */
  SELECT: 'select'
};

/**
 * @namespace DD.ui.renderer
 */