function onDocumentReady () {
  createContentListComponent();
  addContentToList();
  attachEventsOnElement();
}

function attachEventsOnElement () {
  makeElementDraggable($('.contentListItem'));

  $('#rightContainer').droppable({
                                   drop: function (oEvent, ui) {
                                     if (oCurrentlySelectedContent) {
                                       var $draggable = ui.draggable;
                                       var $droppable = $(this);
                                       //$draggable.trigger('selected');
                                       var bDataAdded = displayDataForContentElement($draggable, $droppable);
                                       if (bDataAdded) {
                                         var sCurrentlySelectedContentListItemId = oCurrentlySelectedContent.id;
                                         var $selectedContentListItem = $('.contentListItem[data-id="' + sCurrentlySelectedContentListItemId + '"]')
                                         markContentAsDirty($selectedContentListItem);
                                       }
                                       $droppable.animate({scrollTop: $droppable[0].scrollHeight}, 500);
                                     } else {
                                       alertify.warning("No Content selected to edit, select any content first.");
                                     }
                                   },
                                   accept: ".contentListItem"
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
  $('#createNewContent').on('click', createContentButtonClicked);
  $('#saveContent').on('click', saveContent);
  $('body').on('click', '.insert-image-button', insertImageButtonClicked);
  $('body').on('click', '.contentListItem', null, contentListItemClicked);
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

function getContentHTML (bGetEmptyImageContainer) {
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
      if (bGetEmptyImageContainer || $container.find('img').css('display') != "none") {
        sHtmlContent = sHtmlContent.concat($container[0].outerHTML);
      }
    }
  }

  return sHtmlContent;
}

function openHtmlInNewWindow (sHtml) {
  var $style = $(document.head).find('style').clone();
  var oWindow = window.open();
  $(oWindow.document.head).append($style);
  $(oWindow.document.body).html(sHtml);
}

function createContentButtonClicked (oEvent) {
  alertify.prompt("Add New Content Dialog",
                  "Enter name for the content.",
                  "Type here",
                  createContentDialogCallback,
                  {}
  );
}

function createContentDialogCallback (oEvent, sValue) {
  var oContentData = {};
  oContentData.name = sValue.trim();
  oContentData.id = sValue.trim().replace(/\s/g, '_');
  oContentData.html = '';

  applicationData.contentData[oContentData.id] = oContentData;
  applicationData.contentNameList.push(oContentData.name);

  addContentToList(oContentData);
}

function saveContent () {
  oCurrentlySelectedContent.html = getContentHTML(true);
  oCurrentlySelectedContent.isDirty = false;
  var sCurrentlySelectedContentListItemId = oCurrentlySelectedContent.id;
  var $selectedContentListItem = $('.contentListItem[data-id="' + sCurrentlySelectedContentListItemId + '"]')
  removeDirtyMarkFromContent($selectedContentListItem);
  alertify.success("Content Saved Successfully");
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

function createContentListComponent () {
  var $contentsList = $('#contentList').next().find('.lbjs-list');
  if (!$contentsList.length) {
    $('#contentList').listbox({
                               'searchbar': true,
                               'searchRegex' : ""
                             });
  }
}

function addContentToList (oContent) {
  var $entitiesList = $('#contentList').next().find('.lbjs-list');
  var $entityListItem = null;
  if (oContent) {
    $entityListItem = createNewContentItem(oContent);

    $entitiesList.append($entityListItem);
  } else {
    var oContentData = applicationData.contentData;
    for (var sKey in oContentData) {
      $entityListItem = createNewContentItem(oContentData[sKey]);
      $entitiesList.append($entityListItem);
    }
  }
  $entityListItem.click();
}

function createNewContentItem (oContent) {
  var $contentListItem = $('<div>');
  $contentListItem.addClass('lbjs-item contentListItem');
  var $contentLabel = $('<div class = "contentListItemLabel" title="' + oContent.name + '">' + oContent.name + '</div>')
  $contentListItem.append($contentLabel);
  //var $entityLockIcon = $('<span class="contentLockIcon fa fa-lock"></span>');
  /*if (oContent.lockInfo) {
    if (sSessionId != oContent.lockInfo.sessionId || sTabSessionId != oContent.lockInfo.tabSessionId) {
      $entityLockIcon.addClass('show');
    }
  }*/
  //$contentListItem.append($entityLockIcon);
  $contentLabel.after('<span class="unsavedContent" title="Unsaved Entity" style="display: none">*</span>');
  $contentListItem.attr('data-id', oContent.id);
  $contentListItem.attr('data-name', oContent.name);
  $contentListItem.attr('title', oContent.name);
  return $contentListItem;
}

function markContentAsDirty ($element) {
  oCurrentlySelectedContent.isDirty = true;
  $element.find('.unsavedContent').show();
}

function removeDirtyMarkFromContent ($element) {
  oCurrentlySelectedContent.isDirty = false;
  $element.find('.unsavedContent').hide();
}

function contentListItemClicked (oEvent) {
  $currentlyClickedContentItem = $(oEvent.currentTarget);
  if ((oCurrentlySelectedContent && !oCurrentlySelectedContent.isDirty) || !oCurrentlySelectedContent) {
    var $contentListItem = $(oEvent.currentTarget);
    $('#contentLabel').text($contentListItem.attr('data-name'));
    oCurrentlySelectedContent = applicationData.contentData[$contentListItem.attr('data-id')];
    $currentlySelectedContentItem = $contentListItem;
    $('.contentListItem').removeAttr('selected');
    $contentListItem.attr('selected', 'selected');
    makeElementDraggable($contentListItem);
    var $container = $('#rightContainer');
    $container.empty();
    displayDataForContentElement($contentListItem, $container);
  } else {
    alertify.confirm("Unsaved changes!",
                     "There are unsaved changes in the current content this will be discarded, do you want to proceed?",
                     discardChangesAndOPenNewContent,
                     {});
  }
}

function displayDataForContentElement ($element, $container) {
  var bDataAdded = false;
  if ($element.attr('data-id') == "richTextControl") {
    appendSeperatorDiv($container);
    createTextEditorInContainer($container);
    bDataAdded = true;
  } else if ($element.attr('data-id') == "imageControl") {
    appendSeperatorDiv($container);
    createImageInsertInContainer($container);
    bDataAdded = true;
  } else {
    var sContentHTML = applicationData.contentData[$element.attr('data-name')].html;
    var $contentHolderDiv = $('<div></div>');
    $contentHolderDiv.html(sContentHTML);
    if (sContentHTML) {
      loadContentInRightPanel($contentHolderDiv);
      bDataAdded = true;
    }
  }

  return bDataAdded;
}

function makeElementDraggable ($element) {
  $element.draggable({
                              helper: function () {
                                var dragHeight = 10;
                                var dragWidth = 10;

                                return $('<div class="dragHelperDiv on-drag" >');
                              },
                              start: function (event, ui) {
                                if (!oCurrentlySelectedContent) {
                                  alertify.warning("No Content selected to edit, select any content first.");

                                  return false;
                                }
                                enableGrabCursor();
                              },
                              stop: function (event, ui) {
                                disableGrabCursor();
                              },
                              cursorAt: {top: 10, left: 10},
                              revert: 'invalid',
                              appendTo: 'body'
                            });
}

function discardChangesAndOPenNewContent () {
  removeDirtyMarkFromContent($currentlySelectedContentItem);
  $currentlyClickedContentItem.click();
}