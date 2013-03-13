/**
 * @file
 * jQuery Easy Select
 *
 * Convert a select to hierarchical checkboxes with fancy behaviors.
 */
"use strict";
(function($) {
  // The select object.
  var obj;
  // List of choices.
  var choices;

  // Get the level (the number of leading "-" characters) of a element.
  var level = function(element) {
    return element.label.length - element.label.replace(/^-+/, '').length;
  }

  // Select/unselect an option in the select.
  var toggleValue = function(value, state) {
    obj.find('option[value="' + value + '"]').attr('selected', state);
  }

  // Render children of a value.
  var renderChildren = function(value) {
    var start, currentLevel, children = [];

    if (value) {
      for (var i = 0; i < choices.length; i++) {
        // Found the value
        if (choices[i].value === value) {
          // If it has children, then go on, else return.
          if (choices[i+1] && level(choices[i]) < level(choices[i+1])) {
            start = i + 1;
            break;
          }
          else {
            return;
          }
        }
      }
    }
    else {
      start = 0;
    }

    currentLevel = level(choices[start]);
    while (start < choices.length) {
      var element = choices[start];
      var thisLevel = level(element);
      if (thisLevel === currentLevel) {
        children[start] = '<span class="easy-select-choice"><input type="checkbox" value="' + element.value + '" id="' + element.id + '"/><label for="' + element.id + '">' + element.label.substr(currentLevel) + '</label></span>';
      }
      else if (thisLevel < currentLevel) {
        break;
      }
      start++;
    }
    return children.join();
  }

  $('input').live('click', function() {
    toggleValue($(this).attr('value'), $(this).attr('checked'));
  });

  $.fn.easySelect = function(options) {
    var defaults = {
      // Allow to select multiple options.
      multiple: 1
    };
    var options = $.extend(defaults, options);
    obj = $(this);
    var max_depth = 1;
    // Generate an unique id used for element ids
    var uuid = 'es-' + Math.floor((1 + Math.random()) * 0x100000000).toString(16).substring(1) + '-';
    var start = 1;

    choices = obj.find('option').map(function () {
      var val = $(this).val();

      if (val) {
        return {
          value: val,
          label: $(this).text(),
          id: uuid + start++
        }
      }
    });

    obj.after('<div class="easy-select"><div class="easy-select-choices"></div><div class="easy-select-selected"></div></div>');
    obj.next().find('.easy-select-choices').append($(renderChildren()));

  };
})(jQuery);
