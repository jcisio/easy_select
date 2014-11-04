/**
 * @file
 * jQuery Easy Select
 *
 * Convert a select to hierarchical checkboxes with fancy behaviors.
 *
 * Support jQuery 1.7+ (for old version of jQuery, use version 1.0 of this
 * plugin).
 */

'use strict';

(function($) {
  // The select object.
  var obj;
  // List of choices.
  var choices;
  // Internal data for an easy select instance.
  var data = {};

  // Get the level (the number of leading "-" characters) of a element.
  var level = function(element) {
    return (element.label.length - element.label.replace(/^( - )+/, '').length)/3;
  };

  // Select/unselect an option in the select.
  var toggleValue = function(value, state) {
    obj.find('option[value="' + value + '"]').prop('selected', state);
  };

  /**
   * Join on object as as it were an array.
   */
  var objectJoin = function(obj) {
    var result = [];
    for (var i in obj) {
      result.push(obj[i]);
    }
    return result.join('');
  };

  /**
   * Get the index (position) of an value.
   *
   * @param value
   * @returns {number}
   */
  var getValueIndex = function(value) {
    if (!value) {
      return 0;
    }

    for (var i = 0; i < choices.length; i++) {
      // Found the value
      if (choices[i].value === value) {
        // If it has children, then go on, else return.
        if (choices[i+1] && level(choices[i]) < level(choices[i+1])) {
          return i + 1;
        }
        else {
          return -1;
        }
      }
    }
  };

  // Render children of a value.
  var renderChildren = function(value) {
    var start = getValueIndex(value),
      currentLevel,
      children = {};

    if (start < 0) {
      return;
    }

    currentLevel = level(choices[start]);
    while (start < choices.length) {
      var element = choices[start];
      var thisLevel = level(element);
      if (thisLevel === currentLevel) {
        var checked = obj.find('option[value="' + element.value + '"]').attr('selected') ? ' checked' : '';
        children[element.id] = '<span class="easy-select-choice' + checked + '"><input type="checkbox" value="' + element.value + '"' + checked + ' id="' + element.id + '"/><label for="' + element.id + '">' + element.label.substr(currentLevel*3) + '</label></span>';
      }
      else if (thisLevel < currentLevel) {
        break;
      }
      start++;
    }
    return children;
  };

  /**
   * Generate an unique id used as element ids prefix.
   */
  var generateIdPrefix = function() {
    return 'es-' + Math.floor((1 + Math.random()) * 0x100000000).toString(16).substring(1) + '-';
  };

  /**
   * Move an element between two groups.
   * @param what
   */
  var move = function(what) {
    what.parent().appendTo($('#' + what.attr('id') + '-choices'));
  };

  $(document).on('click', 'input', function() {
    var e = $(this);
    if (!e.parents('#' + data.holder).length) {
      return;
    }
    toggleValue(e.attr('value'), e.is(':checked'));
    e.parent().toggleClass('checked');

    // If not a root element, unselect parent if this is the first child being
    // selected.
    if (e.parents('.easy-select-children').length) {
      var
        eparents = e.parents('.easy-select-children'),
        inputparent = eparents.parent().find('>input');
      if (!eparents.find('input:checked').length && !inputparent.is(':checked')) {
        move(inputparent);
      }
      else if (eparents.find('input:checked').length == 1 && e.is(':checked')) {
        inputparent.click();
      }
    }
    // Otherwise, switch between two sets.
    else if (e.parents('.easy-select-choices').length) {
      e.parent().appendTo($('.easy-select-selected'));
    }
    // Only switch unselected parent if all children are unselected.
    else if (!e.parent().find('input:checked').length) {
      move(e);
    }
  });

  var templates = {
    holder: function() {
      return '<div id="' + data.holder + '" class="easy-select"><div class="easy-select-choices"></div><div class="easy-select-selected"></div></div>';
    },
    children: function(children) {
      return '<span class="easy-select-children">' + objectJoin(children) + '</span>'
    }
  };

  $.fn.easySelect = function(options) {
    var defaults = {
      // Allow to select multiple options.
      multiple: 1
    };
    var options = $.extend(defaults, options);
    var max_depth = 1;
    var uuid = generateIdPrefix();
    var start = 1;
    obj = $(this);
    data.holder = uuid + 'holder';

    choices = obj.find('option').map(function () {
      var val = $(this).val();

      if (val) {
        var id = uuid + start++;
        $(this).attr('data-easy-select', id);
        return {
          value: val,
          label: $(this).text(),
          id: id
        }
      }
    });

    var roots = renderChildren();
    var holder = $(templates.holder());
    for (var id in roots) {
      var children = renderChildren($('option[data-easy-select="' + id + '"]').val());
      var span = $('<span id="' + id + '-choices"></span>');
      var choiceElements = holder.find('.easy-select-choices');
      choiceElements.append(span.append($(roots[id]).append(templates.children(children))));
      if ($('#' + id + '-choices', holder).find('.checked').length) {
        $('#' + id + '-choices > span', holder).appendTo($('.easy-select-selected', holder));
      }
    }
    obj.after(holder);
    obj.hide();
  };
})(jQuery);
