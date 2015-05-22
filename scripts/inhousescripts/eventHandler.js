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
                                       if($currentlySelectedContentItem.hasClass('basic-content-element')){
                                         alertify.warning("Cannot edit basic element");
                                         return false;
                                       }
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
                                       var $container = $contextMenuContainer.parents('.imageContainerFrame');
                                       var sCssClass = ui.cmd;
                                       applyImageScalingCss($container, sCssClass);
                                     },
                                     beforeOpen: function (event, ui) {
                                       var $contextMenuContainer = ui.target;
                                       var $container = $contextMenuContainer.parents('.imageContainerFrame');
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
    $imageDiv = $(oEvent.currentTarget).closest('.addImageOption').siblings('.imageDiv').show();

    var oImageFiles = oEvent.target.files; // FileList object
    addImageToContainer(oImageFiles);
  });
}

function createTextEditorInContainer ($element, oSectionData) {
  if (!oSectionData) {
    oSectionData = $.extend({}, true, applicationData.sectionData.richTextControlSection);
  }
  oSectionData.id = GUID.random();
  aModifiedSectionsOfCurrentContent.push(oSectionData);
  $element.append(getTextEditorDiv(oSectionData));
}

function getTextEditorDiv (oSectionData) {
  var $newEditorContainer = $('<div data-id="'+ oSectionData.id +'" class="right-container-dropped-text-field control-component">');
  var $editor = $('<div class="text-editor contentContainer">');

  $newEditorContainer.append($editor);
  $editor.editable({
                     inlineMode: false,
                     allowStyle: true
                   });

  $editor.on('editable.contentChanged', contentChangedInEditor);

  if (oSectionData.html.trim()) {
    $editor.editable('setHTML', oSectionData.html);
  }
  var sSectionName = oSectionData.name;
  $newEditorContainer.prepend(getSectionTitleBox(sSectionName));

  return $newEditorContainer;
}

function createImageInsertInContainer ($element, oSectionData) {
  if (!oSectionData) {
    oSectionData = $.extend({}, true, applicationData.sectionData.imageControlSection);
  }
  oSectionData.id = GUID.random();
  aModifiedSectionsOfCurrentContent.push(oSectionData);
  $element.append(getImageInsert(oSectionData));
}

function getImageInsert (oSectionData) {
  var $imageFrameComponent = $('<div data-id="'+ oSectionData.id +'" class="right-container-dropped-image-container control-component">');
  var sSectionName = oSectionData.name;
  var $imageContainer = $('<div class="imageContainer"></div>');
  var $addImageOption = $('<div class="addImageOption"><input class="fileUpload" type="file" accept="image/*" style="display: none"/><div class="insert-image-button" title="Add Image"/><div class="insert-image-label">Click to add image</div></div>');
  var $imageDiv = $('<img src="' + oSectionData.imageByte + '" class="imageDiv hasmenu ' + oSectionData.scalingClass + '" style="display: none"/>');
  if (oSectionData.imageByte) {
    $addImageOption.css('display', 'none');
    $imageDiv.css('display', '');
  }
  $imageContainer.append($addImageOption);
  $imageContainer.append($imageDiv);
  $imageFrameComponent.append($imageContainer);
  $imageContainer.wrap('<div class="imageContainerFrame contentContainer ' + oSectionData.scalingClass + '"></div>');
  $imageFrameComponent.prepend(getSectionTitleBox(sSectionName));

  return $imageFrameComponent;
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

function getContentHTML (bGetEmptyContainers) {
  var sHtmlContent = '';
  var $containerElements = $('#rightContainer').children();
  for (var iContainerIndex = 0; iContainerIndex < $containerElements.size(); iContainerIndex++) {
    var $container = $containerElements.eq(iContainerIndex);
    if ($container.hasClass('right-container-dropped-text-field')) {
      var $textEditorDiv = $container.children('.text-editor').eq(0);
      var sSectionTitle = $textEditorDiv.data('section-title');
      sSectionTitle = sSectionTitle ? sSectionTitle : "";
      var $froalaView = $('<div class="froala-view" data-section-title="' + sSectionTitle + '">');
      $froalaView.html($textEditorDiv.editable('getHTML', true, true));
      sHtmlContent = sHtmlContent.concat($froalaView[0].outerHTML);
    } else if ($container.hasClass('right-container-dropped-image-container')) {
      if (bGetEmptyContainers || $container.find('img').css('display') != "none") {
        sHtmlContent = sHtmlContent.concat($container.children('.contentContainer')[0].outerHTML);
      }
    }
  }

  return sHtmlContent;
}

function computeSectionsData () {
  oCurrentlySelectedContent.sections = [];
  for(var iIndex = 0 ; iIndex < aModifiedSectionsOfCurrentContent.length ; iIndex++){
    var oModifiedSection = aModifiedSectionsOfCurrentContent[iIndex];
    oCurrentlySelectedContent.sections.push(oModifiedSection.id);
    var sSectionName;
    if (oModifiedSection.type == "richTextEditor") {
      var $sectionContainer = $('#rightContainer').find('[data-id="'+ oModifiedSection.id +'"]');
      var $textEditorDiv = $sectionContainer.children('.text-editor').eq(0);
      sSectionName = $sectionContainer.find('.section-title-text').val();
      var sHtml = $textEditorDiv.editable('getHTML', false, true);
      oModifiedSection.html = sHtml;

    } else if (oModifiedSection.type == "image") {
      var $sectionContainer = $('#rightContainer').find('[data-id="'+ oModifiedSection.id +'"]');
      sSectionName = $sectionContainer.find('.section-title-text').val();
      var sImageByte = $sectionContainer.find('img').attr('src');
      var sScalingClass = 'fitContentToFrame';
      if (sImageByte) {
         $sectionContainer.find('.imageContainerFrame').hasClass('fitFrameToContent') ?
             sScalingClass = "fitFrameToContent" : null;
      }
      oModifiedSection.imageByte = sImageByte;
      oModifiedSection.scalingClass = sScalingClass;
    }
    oModifiedSection.name = sSectionName;
  }
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
  oContentData.id = GUID.random();
  oContentData.sections = [];
  oContentData.isDirty = false;

  applicationData.contentData[oContentData.id] = oContentData;

  addContentToList(oContentData);
}

function saveContent () {
  computeSectionsData();
  saveSectionData();
  oCurrentlySelectedContent.isDirty = false;
  var $selectedContentListItem = $('.contentListItem[data-id="' + oCurrentlySelectedContent.id + '"]');
  removeDirtyMarkFromContent($selectedContentListItem);
  alertify.success("Content Saved Successfully");
}

function createContentListComponent () {
  /*var $contentsList = $('#contentList').next().find('.lbjs-list');
   if (!$contentsList.length) {
   var $listbox = $('#contentList').listbox({
   'searchbar': true,
   'searchRegex' : ""
   });
   $('#contentList').next().find('.lbjs-list').css('height', '');
   }*/

  var $listContainer = $('#content-list-container');
  var $searchInput = $('<input type="text" id="content-search-input"/>');
  var $contentListData = $('<div id="listData"></div>');
  $listContainer.append($searchInput);
  $listContainer.append($contentListData);
}

function addContentToList (oContent) {
  var $contentList = $('#content-list-container').find('#listData');
  var $contentsListItem = null;
  var $sectionsList = null;
  if (oContent) {
    $contentsListItem = createNewContentItem(oContent);
    $contentList.append($contentsListItem);
    $contentsListItem.click();
  } else {
    var oContentData = applicationData.contentData;
    for (var sKey in oContentData) {
      if (oContentData.hasOwnProperty(sKey)) {
        if (oContentData[sKey].hasOwnProperty('isDirty')) {
          oContentData[sKey].isDirty = false;
        }
        $contentsListItem = createNewContentItem(oContentData[sKey]);
        $contentList.append($contentsListItem);
        $sectionsList = createNewSectionsList(oContentData[sKey].sections);
        $contentList.append($sectionsList);
      }
    }
  }
}

function createNewContentItem (oContent) {
  var $contentListItem = $('<div>');
  $contentListItem.addClass('contentListItem ' + oContent.class);
  $contentListItem.attr('data-type', 'content');
  var $contentLabel = $('<div class = "contentListItemLabel" title="' + oContent.name + '">' + oContent.name + '</div>')
  $contentListItem.append($contentLabel);

  $contentLabel.after('<span class="unsavedContent" title="Unsaved Content" style="display: none">*</span>');
  $contentListItem.attr('data-id', oContent.id);
  $contentListItem.attr('data-name', oContent.name);

  return $contentListItem;
}

function createNewSectionsList (aSections) {
  var $sectionList = $('<div class="sectionList" style="display: none">');

  for (var iIndex = 0; iIndex < aSections.length; iIndex++) {
    var sSectionId = aSections[iIndex];
    var oSection = applicationData.sectionData[sSectionId];
    var $contentListItem = $('<div>');
    $contentListItem.attr('data-type', 'section');
    var $contentLabel = $('<div class = "sectionListItemLabel" title="' + oSection.name + '">' + oSection.name + '</div>')
    $contentListItem.append($contentLabel);

    //$contentLabel.after('<span class="unsavedSection" title="Unsaved Section" style="display: none">*</span>');
    $contentListItem.attr('data-id', oSection.id);
    $contentListItem.attr('data-name', oSection.name);

    $sectionList.append($contentListItem);
  }

  return $sectionList;
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
    aModifiedSectionsOfCurrentContent = [];
    var $contentListItem = $currentlyClickedContentItem;
    $('#contentLabel').text($contentListItem.attr('data-name'));
    oCurrentlySelectedContent = applicationData.contentData[$contentListItem.attr('data-id')];
    $currentlySelectedContentItem = $contentListItem;
    $('.contentListItem').removeAttr('selected');
    $contentListItem.attr('selected', 'selected');
    $('#content-list-container').find('.sectionList').hide();
    $contentListItem.next('.sectionList').show();
    makeElementDraggable($contentListItem);
    var $container = $('#rightContainer');
    $container.empty();
    displayDataForContentElement($contentListItem, $container);
  }
  else {
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
  } else if ($element.attr('data-type') == "content") {
    var aSectionsInContent = applicationData.contentData[$element.attr('data-id')].sections;

    if (aSectionsInContent.length > 0) {
      bDataAdded = true;
      for (var iIndex = 0; iIndex < aSectionsInContent.length; iIndex++) {
        var sSectionId = aSectionsInContent[iIndex];
        var oSection = $.extend({}, true, applicationData.sectionData[sSectionId]);
        appendSeperatorDiv($container);
        if (oSection.type == "richTextEditor") {
          createTextEditorInContainer($container, oSection);
        } else if (oSection.type == "image") {
          createImageInsertInContainer($container, oSection);
        }
      }
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
                                } else if (oCurrentlySelectedContent.id == $(this).attr('data-id')) {
                                  alertify.warning("Content cannot be added inside itself.");

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

function getSectionTitleBox(sName){
  var $titleDiv = $('<div class="section-title">');
  var $titleInputField = $('<input type="text" class="section-title-text"/>');
  if(sName){
    $titleInputField.val(sName);
  }
  $titleDiv.append($titleInputField);

  $titleInputField.on('change',onSectionTitleChange);

  return $titleDiv;
}

function onSectionTitleChange(oEvent){

  var sNewValue = $(oEvent.currentTarget).val();
  var $contentContainer = $(oEvent.currentTarget).closest('.section-title').eq(0).siblings('.contentContainer');
  $contentContainer.attr('data-section-title',sNewValue);
}

function saveSectionData () {
  for (var iIndex = 0; iIndex < aModifiedSectionsOfCurrentContent.length; iIndex++) {
    var oSectionaData = aModifiedSectionsOfCurrentContent[iIndex];
    applicationData.sectionData[oSectionaData.id] = oSectionaData;
  }
}

function contentChangedInEditor (oEvent, $editor) {

}