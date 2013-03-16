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
    return (element.label.length - element.label.replace(/^( - )+/, '').length)/3;
  }

  // Select/unselect an option in the select.
  var toggleValue = function(value, state) {
    obj.find('option[value="' + value + '"]').attr('selected', state);
  }

  // Join on object
  var objectJoin = function(obj) {
    var result = [];
    for (var i in obj) {
      result.push(obj[i]);
    }
    return result.join('');
  }

  // Render children of a value.
  var renderChildren = function(value) {
    var start, currentLevel, children = {};

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
        children[element.id] = '<span class="easy-select-choice"><input type="checkbox" value="' + element.value + '" id="' + element.id + '"/><label for="' + element.id + '">' + element.label.substr(currentLevel*3) + '</label></span>';
      }
      else if (thisLevel < currentLevel) {
        break;
      }
      start++;
    }
    return children;
  }

  $('input').live('click', function() {
    var e = $(this);
    var move = function(what) {
      what.parent().appendTo($('#' + what.attr('id') + '-choices'));
    };
    toggleValue(e.attr('value'), e.attr('checked'));
    e.parent().toggleClass('checked');

    // If not a root element, unselect parent if this is the first child being
    // selected.
    if (e.parents('.easy-select-children').length) {
      var
        eparents = e.parents('.easy-select-children'),
        inputparent = eparents.parent().find('>input');
      if (!eparents.find('input:checked').length && !inputparent.attr('checked')) {
        move(inputparent);
      }
      else if (eparents.find('input:checked').length == 1 && e.attr('checked')) {
        inputparent.click();
      }
      return;
    }

    // Otherwise, switch between two sets.
    if (e.parents('.easy-select-choices').length) {
      e.parent().appendTo($('.easy-select-selected'));
    }
    // Only switch unselected parent if all children are unselected.
    else if (e.parent().find('input[checked]').length == 0) {
      move(e);
    }
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
    var holder = $('<div class="easy-select"><div class="easy-select-choices"></div><div class="easy-select-selected"></div></div>');
    for (var id in roots) {
      var children = renderChildren($('option[data-easy-select="' + id + '"]').val());
      $('.easy-select-choices', holder).append($('<span id="' + id + '-choices"></span>').append($(roots[id]).append('<span class="easy-select-children">' + objectJoin(children) + '</span>')));
      $('.easy-select-selected', holder);
    }
    obj.after(holder);
    obj.hide();
  };
})(jQuery);

