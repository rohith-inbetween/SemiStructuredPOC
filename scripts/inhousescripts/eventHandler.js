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
                                'border: 1px solid white;'
                              });
                            },
                            cursorAt: {top: 5, left: 5},
                            revert: 'invalid',
                            appendTo: 'body'
                          });

  $('#rightContainer').droppable({
                                   drop: function (oEvent, ui) {
                                     var $draggable = ui.draggable;

                                     if ($draggable.attr('id') == "richTextControl") {
                                       createTextEditorInContainer($(this));

                                     } else if ($draggable.attr('id') == "imageControl") {
                                       createImageInsertInContainer($(this));
                                     }
                                   },
                                   accept: ".control"
                                 });

  $('body').on('click', '.insert-image-button', inserImageButtonClicked);

  $('body').on('change', '#fileUpload', function (oEvent) {
    var $addImageButton = $(oEvent.currentTarget).siblings('.insert-image-button').hide();
    $imageDiv = $(oEvent.currentTarget).siblings('.imageDiv').show();

    var oImageFiles = oEvent.target.files; // FileList object
    addImageToContainer(oImageFiles);
  });
}

function createTextEditorInContainer ($element) {

  $element.append(getTextEditorDiv());

}

function getTextEditorDiv () {
  var $newEditorContainer = $('<div class="right-container-dropped-text-field">');
  var $editor = $('<div class="text-editor">');
  $newEditorContainer.append($editor);
  $editor.editable({inlineMode: false});

  return $newEditorContainer;
}

function createImageInsertInContainer ($element) {

  $element.append(getImageInsert());

}

function getImageInsert () {
  var $newImageContainer = $('<div class="right-container-dropped-image-container">');
  var $imageContainer = $('<div id="imageContainer"></div>');
  var $addImageButton = $('<input id="fileUpload" type="file" accept="image/*" style="display: none"/><div class="insert-image-button" title="Add Image">');
  var $imageDiv = $('<img src="" class="imageDiv" style="display: none"/>');
  $imageContainer.append($addImageButton);
  $imageContainer.append($imageDiv);
  $newImageContainer.append($imageContainer);

  return $newImageContainer;
}

function inserImageButtonClicked (oEvent) {
  var $button = $(oEvent.currentTarget);
  var $fileUploader = $button.prev('#fileUpload');
  $fileUploader.click();
}

function addImageToContainer (oImageFiles) {
  var oImageFile = oImageFiles[0];
  var oFileReader = new FileReader();

  oFileReader.onload = (function (file) {
    return function (e) {
      if (file.type.indexOf('image') != -1) {
        $imageDiv.attr('src', e.target.result);
        $imageDiv = null;
      }
    }
  })(oImageFile);

  oFileReader.readAsDataURL(oImageFile);
}