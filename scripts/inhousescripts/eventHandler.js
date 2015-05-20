function onDocumentReady () {
  addContentsToListInLeftPanel();
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
                                     } else {
                                       var sContentHTML = applicationData.contentData[$draggable.attr('data-name')].html;
                                       var $contentHolderDiv = $('<div></div>');
                                       $contentHolderDiv.html(sContentHTML);
                                       loadContentInRightPanel($contentHolderDiv);
                                     }
                                     $(this).animate({scrollTop: $(this)[0].scrollHeight}, 500);
                                   },
                                   accept: ".control"
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

  $('#exportHTML').on('click', exportToHtmlButtonClicked);
  $('#saveContent').on('click', saveContentButtonClicked);
  $('body').on('click', '.insert-image-button', insertImageButtonClicked);

  $('body').on('change', '.fileUpload', function (oEvent) {
    $(oEvent.currentTarget).siblings('.insert-image-button,.insert-image-label').remove();
    $imageDiv = $(oEvent.currentTarget).siblings('.imageDiv').show();

    var oImageFiles = oEvent.target.files; // FileList object
    addImageToContainer(oImageFiles);
  });
}

function createTextEditorInContainer ($element) {

  $element.append(getTextEditorDiv());

}

function getTextEditorDiv (sHtml) {
  var $newEditorContainer = $('<div class="right-container-dropped-text-field control-component">');
  var $editor = $('<div class="text-editor">');
  $newEditorContainer.append($editor);
  $editor.editable({
                     inlineMode: false,
                     allowStyle: true
                   });

  if (sHtml) {
    $editor.editable('setHTML', sHtml);
  }

  return $newEditorContainer;
}

function createImageInsertInContainer ($element) {

  $element.append(getImageInsert());

}

function getImageInsert () {
  var $newImageContainer = $('<div class="right-container-dropped-image-container control-component fitContentToFrame">');
  //$newImageContainer.css(oFitContentToFrameCss);
  var $imageContainer = $('<div class="imageContainer"></div>');
  var $addImageButton = $('<input class="fileUpload" type="file" accept="image/*" style="display: none"/><div class="insert-image-button" title="Add Image"/><div class="insert-image-label">Click to add image</div>');
  var $imageDiv = $('<img src="" class="imageDiv hasmenu fitContentToFrame" style="display: none"/>');
  //$imageDiv.css(oImageDivCssForFitToFrame);
  $imageContainer.append($addImageButton);
  $imageContainer.append($imageDiv);
  $newImageContainer.append($imageContainer);

  return $newImageContainer;
}

function insertImageButtonClicked (oEvent) {
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
  $element.find('img').addClass(sCssClass);
  /*if (sCssClass == "fitContentToFrame") {
    $element.css(oFitContentToFrameCss);
    $element.find('img').css(oImageDivCssForFitToContent);
  } else {
    $element.css(oFitFrameToContentCss);
    $element.find('img').css(oImageDivCssForFitToFrame);
  }*/
}

function exportToHtmlButtonClicked (oEvent) {
  var sContentHTML = getContentHTML();
  openHtmlInNewWindow(sContentHTML);
}

function getContentHTML () {
  var sHtmlContent = '';
  var $containerElements = $('#rightContainer').children();
  for (var iContainerIndex = 0; iContainerIndex < $containerElements.size(); iContainerIndex++) {
    var $container = $containerElements.eq(iContainerIndex);
    if ($container.hasClass('right-container-dropped-text-field')) {
      var $textEditorDiv = $container.children('.text-editor').eq(0);
      var $froalaView = $textEditorDiv.find('.froala-view').clone();
      $froalaView.html($textEditorDiv.editable('getHTML', true, true));
      sHtmlContent = sHtmlContent.concat($froalaView[0].outerHTML);
    } else if ($container.hasClass('right-container-dropped-image-container')) {
      sHtmlContent = sHtmlContent.concat($container[0].outerHTML);
    }
  }

  return sHtmlContent;
}

function getContentPanelHTML () {

  return $('#rightContainer').html();
}

function openHtmlInNewWindow (sHtml) {
  var $style = $(document.head).find('style').clone();
  var oWindow = window.open();
  $(oWindow.document.head).append($style);
  $(oWindow.document.body).html(sHtml);
}

function saveContentButtonClicked (oEvent) {
  alertify.prompt("Save Content Dialog",
                  "Enter name for the content.",
                  "Type here",
                  saveContentDialogCallback,
                  {}
  );
}

function saveContentDialogCallback (oEvent, sValue) {
  var oContentData = {};
  oContentData.name = sValue.trim();
  oContentData.html = getContentHTML();

  applicationData.contentData[oContentData.name] = oContentData;
  applicationData.contentNameList.push(oContentData.name);

  addContentsToListInLeftPanel(oContentData.name);
}

function addContentsToListInLeftPanel (sContentName) {
  var $contentListConttainer = $('#leftPanel #controlsContainer');

  if (sContentName) {
    var $contentItem = getContentItemDivForLeftPanel(sContentName);
    $contentListConttainer.append($contentItem);
  } else {
    var aContentNames = applicationData.contentNameList;

    for (var iIndex = 0; iIndex < aContentNames.length; iIndex++) {
      var sContentName = aContentNames[iIndex];
      var $contentItem = getContentItemDivForLeftPanel(sContentName);
      $contentListConttainer.append($contentItem);
    }
  }

}

function getContentItemDivForLeftPanel (sContentName) {
  var sContentItemDivId = sContentName.trim().replace(/\s/g, '_');
  var $contentItem = $('<div id="' + sContentItemDivId + ' " class="control innerBorder" title="' + sContentName +
                       '" data-name="' + sContentName + '">' + sContentName + '</div>');

  return $contentItem;
}

function loadContentInRightPanel ($contentHolderDiv) {
  var $aContents = $contentHolderDiv.children();
  var $rightPanel = $('#rightContainer');
  if ($rightPanel.children().length > 0) {
    appendSeperatorDiv($rightPanel);
  }

  for (var iIndex = 0; iIndex < $aContents.length; iIndex++) {
    var $container = $aContents.eq(iIndex);
    if ($container.hasClass('froala-view')) {
      var $textEditorCOntent = $container.html();
      var $textEditor = getTextEditorDiv($textEditorCOntent);
      $rightPanel.append($textEditor);
    } else {
      $rightPanel.append($container);
    }

    if (iIndex < $aContents.length - 1) {
      appendSeperatorDiv($rightPanel);
    }
  }

}