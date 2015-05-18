function onDocumentReady () {

  attachEventsOnElement();
}

function attachEventsOnElement () {
  $('.control').draggable({
                            helper: function () {
                              var dragHeight = 20;
                              var dragWidth = 20;

                              return $('<div>', {
                                style: 'height: ' + dragHeight + 'px; ' +
                                'width: ' + dragWidth + 'px; ' +
                                'border: 1px solid red;'
                              });
                            },
                            cursorAt: { top: 5, left: 5 },
                            revert: 'invalid',
                            appendTo: 'body'
                          });
  $('#rightContainer').droppable({
                                   drop: function(oEvent, $draggable ) {
                                     createTextEditorInContainer($(this));
                                   },
                                   accept: ".control"
                                 });
}

function createTextEditorInContainer($element) {

  var $newEditorDiv = $('<div class="right-container-dropped-text-field">');
  $element.append($newEditorDiv);

  $newEditorDiv.editable({inlineMode: false});
}