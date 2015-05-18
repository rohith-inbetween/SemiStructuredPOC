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

function createTextEditorInContainer($element){

    $element.append(getTextEditorDiv());

}

function getTextEditorDiv(){
    var $newEditorContainer = $('<div class="right-container-dropped-text-field">');
    var $editor = $('<div class="text-editor">');
    $newEditorContainer.append($editor);
    $editor.editable({inlineMode:false});

    return $newEditorContainer;
}

function createImageInsertInContainer($element){

    $element.append(getImageInsert());

}

function getImageInsert(){

    var $newImageContainer = $('<div class="right-container-dropped-image-container">');
    var $addImageButton = $('<div class="insert-image-button">');

    $newImageContainer.append($addImageButton);

    return $newImageContainer;
}