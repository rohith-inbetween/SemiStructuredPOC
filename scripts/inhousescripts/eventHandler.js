function onDocumentReady () {

  attachEventsOnElement();
}

function attachEventsOnElement () {
  $('.control').draggable({
                            helper: function () {
                              var dragHeight = 10;
                              var dragWidth = 10;

                              return $('<div class="dragHelperDiv on-drag" >');
                            },
                            start: function (event, ui) {
                              enableGrabCursor();
                            },
                            stop: function (event, ui) {
                              disableGrabCursor();
                            },
                            cursorAt: {top: 10, left: 10},
                            revert: 'invalid',
                            appendTo: 'body'
                          });

  $('#rightContainer').droppable({
                                   drop: function (oEvent, ui) {
                                     var $draggable = ui.draggable;

                                     if ($draggable.attr('id') == "richTextControl") {
                                       appendSeperatorDiv($(this));
                                       createTextEditorInContainer($(this));

                                     } else if ($draggable.attr('id') == "imageControl") {
                                       appendSeperatorDiv($(this));
                                       createImageInsertInContainer($(this));
                                     }
                                     $(this).animate({ scrollTop: $(this)[0].scrollHeight}, 500);
                                   },
                                   accept: ".control"
                                 });

  $('body').on('click', '.insert-image-button', inserImageButtonClicked);

  $('body').on('change', '.fileUpload', function (oEvent) {
    $(oEvent.currentTarget).siblings('.insert-image-button,.insert-image-label').remove();
    $imageDiv = $(oEvent.currentTarget).siblings('.imageDiv').show();

    var oImageFiles = oEvent.target.files; // FileList object
    addImageToContainer(oImageFiles);
  });

  $("#rightContainer").contextmenu({
                                     delegate: ".hasmenu",
                                     menu: [
                                       {
                                         title: "Fit Content to Frame",
                                         cmd: "fitContentToFrame",
                                         uiIcon: "ui-icon-arrow-4"
                                       },
                                       {
                                         title: "Fit Frame to Content",
                                         cmd: "fitFrameToContent",
                                         uiIcon: "ui-icon-arrow-4-diag"
                                       }
                                     ],
                                     select: function (event, ui) {
                                       var $contextMenuContainer = ui.target;
                                       var $container = $contextMenuContainer.parents('.right-container-dropped-image-container');
                                       var sCssClass = ui.cmd;
                                       applyImageScalingCss($container, sCssClass);
                                     },
                                     beforeOpen: function (event, ui) {
                                       var $contextMenuContainer = ui.target;
                                       var $container = $contextMenuContainer.parents('.right-container-dropped-image-container');
                                       if ($container.hasClass('fitContentToFrame')) {
                                         $('#rightContainer').contextmenu("showEntry", "fitContentToFrame", false);
                                         $('#rightContainer').contextmenu("showEntry", "fitFrameToContent", true);
                                       } else {
                                         $('#rightContainer').contextmenu("showEntry", "fitFrameToContent", false);
                                         $('#rightContainer').contextmenu("showEntry", "fitContentToFrame", true);
                                       }
                                     }
                                   });
}

function createTextEditorInContainer ($element) {

  $element.append(getTextEditorDiv());

}

function getTextEditorDiv () {
  var $newEditorContainer = $('<div class="right-container-dropped-text-field control-component">');
  var $editor = $('<div class="text-editor">');
  $newEditorContainer.append($editor);
  $editor.editable({inlineMode: false});

  return $newEditorContainer;
}

function createImageInsertInContainer ($element) {

  $element.append(getImageInsert());

}

function getImageInsert () {
  var $newImageContainer = $('<div class="right-container-dropped-image-container control-component fitContentToFrame">');
  var $imageContainer = $('<div class="imageContainer"></div>');
  var $addImageButton = $('<input class="fileUpload" type="file" accept="image/*" style="display: none"/><div class="insert-image-button" title="Add Image"/><div class="insert-image-label">Click to add image</div>');
  var $imageDiv = $('<img src="" class="imageDiv hasmenu" style="display: none"/>');
  $imageContainer.append($addImageButton);
  $imageContainer.append($imageDiv);
  $newImageContainer.append($imageContainer);

  return $newImageContainer;
}

function inserImageButtonClicked (oEvent) {
  var $button = $(oEvent.currentTarget);
  var $fileUploader = $button.prev('.fileUpload');
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

function enableGrabCursor () {
  $('body').css('cursor', 'url(../images/closedhand.cur),move');
}

function disableGrabCursor () {
  $('body').css('cursor', '');
}

function appendSeperatorDiv ($element) {
  if ($('#rightContainer .control-component').length > 0) {
    var $seperatorDiv = $('<div class="right-container-field-seperator innerBorder">');
    $element.append($seperatorDiv);
  }
}

function applyImageScalingCss ($element, sCssClass) {
  $element.removeClass('fitContentToFrame fitFrameToContent');
  $element.addClass(sCssClass);
}

function exportContentHTML(){
  var sHtmlContent = '';
  var $containerElements = $('#rightContainer').children();
  for(var iContainerIndex = 0 ; iContainerIndex < $containerElements.size() ; iContainerIndex++){
    var $container = $containerElements.eq(iContainerIndex);
    if($container.hasClass('right-container-dropped-text-field')){
      var $textEditorDiv = $container.children('.text-editor').eq(0);
      sHtmlContent = sHtmlContent.concat($textEditorDiv.editable('getHTML',true,true));
    } else if($container.hasClass('right-container-dropped-image-container')){
      var $imageContainer = $container.children('.imageContainer').eq(0);
      sHtmlContent = sHtmlContent.concat($imageContainer.html());
    }
  }

  return sHtmlContent;
}