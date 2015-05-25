function onDocumentReady () {
  createContentListComponent();
  addContentToList();
  attachEventsOnElement();
}

function attachEventsOnElement () {
  $('#exportHTML').on('click', exportToHtmlButtonClicked);
  $('#createNewContent').on('click', createContentButtonClicked);
  $('#saveContent').on('click', saveContent);
  $('body').on('click', '.insert-image-button', insertImageButtonClicked);
  $('body').on('click', '.contentListItem', null, contentListItemClicked);
  $('body').on('click', '.content-section-expander', null, contentListItemExpanderClicked);
  $('body').on('change', '.fileUpload', uploadImage);
  $('body').on('click', '.remove-section', removeSectionRightPanelClicked);
  $('body').on('click', '.remove-listitem', removeListItemClicked);
  $('body').on('click', '.edit-listitem', editListItemClicked);

  makeElementDraggable($('.contentListItem'));

  $('#rightContainer').droppable({
                                   drop: function (oEvent, ui) {
                                     var $draggable = ui.draggable;
                                     dropContent($(this), $draggable);
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

}

function createTextEditorInContainer ($element, oSectionData, bToBeAppendedInBetween, bDataBeingModified) {
  appendSeperatorDiv($element, bToBeAppendedInBetween);
  if (!oSectionData) {
    oSectionData = $.extend({}, true, applicationData.sectionData.richTextControlSection);
    if(bDataBeingModified){
      oSectionData.originalContentId = oCurrentlySelectedContent.id;
      oSectionData.originalContentName = oCurrentlySelectedContent.name;
    }
  } else {
    oSectionData = $.extend({}, true, oSectionData);
  }

  if (bDataBeingModified) {
    if (oCurrentlySelectedContent && oSectionData.originalContentId != oCurrentlySelectedContent.id) {
      oSectionData.name = oSectionData.name + '-' + oSectionData.originalContentName;
    }
    oSectionData.id = GUID.random();
  }
  aModifiedSectionsOfCurrentContent.push(oSectionData);

  if (bToBeAppendedInBetween) {
    $element.before(getTextEditorDiv(oSectionData));
  } else {
    $element.append(getTextEditorDiv(oSectionData));
  }
}

function getTextEditorDiv (oSectionData) {
  var title = "";
  if(oSectionData.originalContentName){
    title = "Original content - " + oSectionData.originalContentName;
  }
  var $newEditorContainer = $('<div title="' + title + '" data-id="'+ oSectionData.id +'" class="right-container-dropped-text-field control-component">');
  var $editor = $('<div class="text-editor contentContainer">');

  $newEditorContainer.append($editor);
  $editor.editable({
                     inlineMode: false,
                     allowStyle: true
                   });

  $editor.on('editable.contentChanged', contentChangedInSection);

  if (oSectionData.html.trim()) {
    $editor.editable('setHTML', oSectionData.html);
  }
  var sSectionName = oSectionData.name;
  $newEditorContainer.prepend(getSectionTitleBox(sSectionName));
  $newEditorContainer.prepend($('<div class="remove-section fa fa-times-circle" title="Remove Section">'));

  return $newEditorContainer;
}

function createImageInsertInContainer ($element, oSectionData, bToBeAppendedInBetween, bDataBeingModified) {
  appendSeperatorDiv($element, bToBeAppendedInBetween);
  if (!oSectionData) {
    oSectionData = $.extend({}, true, applicationData.sectionData.imageControlSection);
    if(bDataBeingModified){
      oSectionData.originalContentId = oCurrentlySelectedContent.id;
      oSectionData.originalContentName = oCurrentlySelectedContent.name;
    }
  } else {
    oSectionData = $.extend({}, true, oSectionData);
  }

  if(bDataBeingModified){
    if (oCurrentlySelectedContent && oSectionData.originalContentId != oCurrentlySelectedContent.id) {
      oSectionData.name = oSectionData.name + '-' + oSectionData.originalContentName;
    }
    oSectionData.id = GUID.random();
  }
  aModifiedSectionsOfCurrentContent.push(oSectionData);

  if (bToBeAppendedInBetween) {
    $element.before(getImageInsert(oSectionData));
  } else {
    $element.append(getImageInsert(oSectionData));
  }
}

function getImageInsert (oSectionData) {
  var title = "";
  if(oSectionData.originalContentName){
    title = "Original Content - " + oSectionData.originalContentName;
  }
  var $imageFrameComponent = $('<div title="' + title + '" data-id="'+ oSectionData.id +'" class="right-container-dropped-image-container control-component">');
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
  $imageFrameComponent.prepend($('<div class="remove-section fa fa-times-circle" title="Remove Section">'));

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
        contentChangedInSection();
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

function appendSeperatorDiv ($element, bToBeAppendedInBetween) {
  //if ($('#rightContainer .control-component').length > 0) {
    var $seperatorDiv = $('<div class="right-container-field-seperator"><div id="seperator-line"></div></div>');

    if (bToBeAppendedInBetween) {
      $element.before($seperatorDiv);
    } else {
      $element.append($seperatorDiv);
    }

    $seperatorDiv.droppable({
                              hoverClass: "dragHover",
                              greedy: true,
                              drop: function (oEvent, ui) {
                                var $draggable = ui.draggable;
                                dropContent($(this), $draggable);
                              },
                              accept: ".contentListItem"
                            });
  //}
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
    var oSectionObj = {id:oModifiedSection.id, name:oModifiedSection.name};
    oCurrentlySelectedContent.sections.push(oSectionObj);
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
  oContentData.type = 'content';
  applicationData.contentData[oContentData.id] = oContentData;

  addContentToList(oContentData);
}

function saveContent (oEvent) {
  if (!$(oEvent.target).hasClass('disabled')) {
    computeSectionsData();
    saveSectionData();
    oCurrentlySelectedContent.isDirty = false;
    var $sectionList = createNewSectionsList(oCurrentlySelectedContent);
    var $selectedContentListItem = $('.contentListItem[data-id="' + oCurrentlySelectedContent.id + '"]');
    var $oldSectionList = $selectedContentListItem.next('.sectionList');
    $sectionList.css('display', $oldSectionList.css('display'));
    $oldSectionList.replaceWith($sectionList);
    removeDirtyMarkFromContent($selectedContentListItem);
    makeElementDraggable($('.contentListItem'));
    if (oCurrentlySelectedContent.sections.length) {
      $selectedContentListItem.find('.content-section-expander').css('visibility', 'visible');
    }

    alertify.success("Content Saved Successfully");
  }
}

function createContentListComponent () {
  var $listContainer = $('#content-list-container');
  var $searchInput = $('<input type="text" id="content-search-input" placeholder="Search.."/>');
  var $contentListData = $('<div id="listData"></div>');
  $listContainer.append($searchInput);
  $listContainer.append($contentListData);
  $searchInput.keyup(function(oEvent){
    var $input = $(oEvent.currentTarget);
    var searchString = $input.val();
    $('#listData').jstree(true).search(searchString);
  });
}

function addContentToList (oContent) {
  var $contentList = $('#content-list-container').find('#listData');
  if (oContent) {
    var $contentsListItem = addContentItemDivToList($contentList, oContent);
    $contentsListItem.click();
  } else {
    var oContentData = applicationData.contentData;
    for (var sKey in oContentData) {
      if (oContentData.hasOwnProperty(sKey)) {
        if (oContentData[sKey].hasOwnProperty('isDirty')) {
          oContentData[sKey].isDirty = false;
        }
        addContentItemDivToList($contentList, oContentData[sKey]);
      }
    }
  }
}

function addContentItemDivToList ($contentList, oContent) {
  var $contentsListItem = createNewContentItem(oContent);
  $contentList.append($contentsListItem);
  var $sectionsList = createNewSectionsList(oContent);
  $contentList.append($sectionsList);

  return $contentsListItem;
}

function createNewContentItem (oContent) {

  var sType = oContent.class == "basic-content-element" ? "section" : "content";
  var $contentListItem = $('<div class="contentListItem '+ oContent.class +'">');
  $contentListItem.attr('data-id', oContent.id);
  $contentListItem.attr('data-name', oContent.name);
  $contentListItem.addClass('contentListItem ' + oContent.class);
  $contentListItem.attr('data-type', sType);
  var $contentLabel = $('<div class = "contentListItemLabel" title="' + oContent.name + '">' + oContent.name + '</div>')
  $contentListItem.append($contentLabel);

  $contentLabel.before('<span class="content-section-expander fa fa-chevron-circle-right"></span>');
  $contentLabel.after('<span class="unsavedContent" style="display: none">*</span>');
  if (!oContent.sections.length) {
    $contentListItem.find('.content-section-expander').css('visibility', 'hidden');
  }
  $contentListItem.prepend($('<div class="edit-listitem fa fa-pencil-square-o">'));
  $contentListItem.prepend($('<div class="remove-listitem fa fa-times-circle">'));
  return $contentListItem;
}

function createNewSectionsList (oContent) {
  var aSections = oContent.sections;
  var $sectionList = $('<div class="sectionList" style="display: none">');

  for (var iIndex = 0; iIndex < aSections.length; iIndex++) {
    var oSectionObj = aSections[iIndex];
    var oSection = applicationData.sectionData[oSectionObj.id];
    var $contentListItem = $('<div class="contentListItem">');
    $contentListItem.attr('data-type', 'section');
    $contentListItem.attr('data-id', oSection.id);
    $contentListItem.attr('data-name', oSection.name);
    $contentListItem.attr('data-content-id', oContent.id);
    $contentListItem.attr('data-content-name', oContent.name);
    var originalContentId = oSection.originalContentId;
    var originalContentName = oSection.originalContentName;
    $contentListItem.attr('title', 'Original Content - ' + originalContentName);
    $contentListItem.attr('data-original-content-id', originalContentId);
    $contentListItem.attr('data-original-content-name', originalContentName);

    if(oSection.type){
      $contentListItem.attr('data-section-type', oSection.type);
    }
    var $contentLabel = $('<div class = "contentListItemLabel" title="' + oSection.name + '">' + oSection.name + '</div>')
    $contentListItem.append($contentLabel);
    $contentListItem.prepend($('<div class="remove-listitem fa fa-times-circle">'));

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
  var $contentListItem = $(oEvent.currentTarget);
  $currentlyClickedContentItem = $contentListItem;
  if ((oCurrentlySelectedContent && !oCurrentlySelectedContent.isDirty) || !oCurrentlySelectedContent) {
    $('.contentListItem').removeClass('selected');
    $contentListItem.addClass('selected');
    aModifiedSectionsOfCurrentContent = [];
    $currentlySelectedContentItem = $contentListItem;

    var sListItemName = $contentListItem.attr('data-name');
    var sListItemType = $contentListItem.attr('data-type');
    var sListItemId = $contentListItem.attr('data-id');
    var $container = $('#rightContainer');
    if(sListItemType == 'content'){
      $container.attr('container-type','content');
      oCurrentlySelectedContent = applicationData.contentData[sListItemId];
      $('#contentLabel').text("Content : " + sListItemName);
      $('#saveContent').removeClass('disabled');
    } else if(sListItemType == 'section'){
      $container.attr('container-type','section');
      oCurrentlySelectedContent = applicationData.sectionData[sListItemId];
      $('#contentLabel').text("Section : " + sListItemName);
      $('#saveContent').addClass('disabled');
    }
    $container.empty();
    displayDataForContentElement($contentListItem, $container, false);
  }
  else {
    alertify.confirm("Unsaved changes!",
                     "There are unsaved changes in the current content this will be discarded, do you want to proceed?",
                     discardChangesAndOPenNewContent,
                     {});
  }
}

function displayDataForContentElement ($element, $container, bDataBeingModified) {
  var bDataAdded = false;
  var bToBeAppendedInBetween = $container.hasClass('right-container-field-seperator');

  if($element.attr('data-type') == "section"){
    var sSectionId = $element.attr('data-id');
    var sSectionType = $element.attr('data-section-type');
    var oSection = applicationData.sectionData[sSectionId];
    if (sSectionId == "richTextControl" ||
        (sSectionType && sSectionType == "richTextEditor")) {
      createTextEditorInContainer($container, oSection, bToBeAppendedInBetween, bDataBeingModified);
      bDataAdded = true;
    } else if (sSectionId == "imageControl" ||
        (sSectionType && sSectionType == "image")) {
      createImageInsertInContainer($container, oSection, bToBeAppendedInBetween, bDataBeingModified);
      bDataAdded = true;
    }
  }else if ($element.attr('data-type') == "content") {
    var aSectionsInContent = applicationData.contentData[$element.attr('data-id')].sections;

    if (aSectionsInContent.length > 0) {
      bDataAdded = true;
      for (var iIndex = 0; iIndex < aSectionsInContent.length; iIndex++) {
        var sSectionId = aSectionsInContent[iIndex].id;
        var oSection = $.extend({}, true, applicationData.sectionData[sSectionId]);
        if (oSection.type == "richTextEditor") {
          createTextEditorInContainer($container, oSection, bToBeAppendedInBetween, bDataBeingModified);
        } else if (oSection.type == "image") {
          createImageInsertInContainer($container, oSection, bToBeAppendedInBetween, bDataBeingModified);
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

                                return $('<div class="dragHelperDiv" >');
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

function contentListItemExpanderClicked (oEvent) {
  oEvent.stopPropagation();
  var $expanderIcon = $(this);
  if ($expanderIcon.hasClass('fa-chevron-circle-right')) {
    $expanderIcon.removeClass('fa-chevron-circle-right');
    $expanderIcon.addClass('fa-chevron-circle-down');
  } else {
    $expanderIcon.removeClass('fa-chevron-circle-down');
    $expanderIcon.addClass('fa-chevron-circle-right');
  }

  var $sectionList = $expanderIcon.parents('.contentListItem').next('.sectionList');
  if ($sectionList.css('display') == 'none') {
    $sectionList.show();
  } else {
    $sectionList.hide();
  }
}

function dropContent ($droppable, $draggable) {
  if (oCurrentlySelectedContent) {
    if($currentlySelectedContentItem.hasClass('basic-content-element')){
      alertify.warning("Cannot edit basic element");
      return false ;
    }
    var bDataAdded = displayDataForContentElement($draggable, $droppable, true);
    if (bDataAdded) {
      var sCurrentlySelectedContentListItemId = oCurrentlySelectedContent.id;
      var $selectedContentListItem = $('.contentListItem[data-id="' + sCurrentlySelectedContentListItemId + '"]');
      markContentAsDirty($selectedContentListItem);
    }
    $droppable.animate({scrollTop: $droppable[0].scrollHeight}, 500);
  } else {
    alertify.warning("No Content selected to edit, select any content first.");
  }
}

function uploadImage (oEvent) {
  $(oEvent.currentTarget).siblings('.insert-image-button,.insert-image-label').remove();
  $imageDiv = $(oEvent.currentTarget).closest('.addImageOption').siblings('.imageDiv').show();

  var oImageFiles = oEvent.target.files; // FileList object
  addImageToContainer(oImageFiles);
}

function contentChangedInSection () {
  var $container = $('#rightContainer');
  if($container.attr('container-type') == 'content'){
    var contentId = oCurrentlySelectedContent.id;
    var $element = $('.contentListItem[data-id="' + contentId + '"]');
    markContentAsDirty($element);
  }
}

function removeSectionRightPanelClicked(oEvent){
  var $sectionFrame =$(oEvent.currentTarget).closest('.control-component');
  var oMethodProxy = $.proxy(function($frameToDelete){
    var sSectionId = $frameToDelete.attr('data-id');
    removeSectionFromCurrentlySelectedContent(sSectionId, true);
    $frameToDelete.prev('.right-container-field-seperator').remove();
    $frameToDelete.remove();
    $('[data-id="' + sSectionId + '"]').remove();
  },this,$sectionFrame);
  confirmDelete(oMethodProxy);
}

function removeSectionFromCurrentlySelectedContent(sSectionId){
  removeSectionFromSectionsList(aModifiedSectionsOfCurrentContent, sSectionId);
  removeSectionFromSectionsList(oCurrentlySelectedContent.sections, sSectionId);
  markContentAsDirty($('.contentListItem[data-id="' + oCurrentlySelectedContent.id + '"]'));
}

function removeListItemClicked(oEvent){
  var $listItem =$(oEvent.currentTarget).closest('.contentListItem');

  var oMethodProxy = $.proxy(function($listItemToDelete){
    var sItemId = $listItemToDelete.attr('data-id');
    var sItemType = $listItemToDelete.attr('data-type');
    if(sItemType == 'content'){
      removeContent(sItemId);
      $listItemToDelete.next('.sectionList').remove();
    } else if(sItemType == 'section'){
      var sContentId = $listItemToDelete.attr('data-content-id');
      removeSectionFromContent(sContentId, sItemId);
    }
    $listItemToDelete.remove();
  }, this, $listItem);
  confirmDelete(oMethodProxy);

}

function removeSectionFromContent(sContentId,sSectionId){
  var oContent = applicationData.contentData[sContentId];
  var aSectionsOfContent = oContent.sections;
  removeSectionFromSectionsList(aSectionsOfContent, sSectionId);
}

function removeContent(sContentId){
  if(oCurrentlySelectedContent && oCurrentlySelectedContent.id == sContentId){
    oCurrentlySelectedContent = null;
    $currentlySelectedContentItem = null;
    aModifiedSectionsOfCurrentContent = [];
    $('#rightContainer').empty()
  }
  delete(applicationData.contentData[sContentId]);
}

function removeSectionFromSectionsList(aSectionsOfContent, sSectionId){
  for(var iSectionIndex = aSectionsOfContent.length - 1 ; iSectionIndex >= 0 ; iSectionIndex--){
    var oSection = aSectionsOfContent[iSectionIndex];
    if(oSection.id == sSectionId){
      aSectionsOfContent.splice(iSectionIndex,1);
      break;
    }
  }
}

function confirmDelete(oMethodProxy){
  alertify.confirm('Are you sure you wish to delete?', oMethodProxy);
}

function editListItemClicked(oEvent){
  oEvent.stopPropagation();
  var $listItem = $(oEvent.currentTarget).closest('.contentListItem ');
  var $listItemLabel = $listItem.find('.contentListItemLabel');

  alertify.prompt("Edit List Item",
      "Enter new name for the item.",
      $listItemLabel.text(),
      function(evt,val){
        editListItemName($listItem, val);
      },{}
  );
}

function editListItemName($listItem, sNewListName){
  $listItem.attr('data-name',sNewListName);
  var sListItemId = $listItem.attr('data-id');
  var sListItemType = $listItem.attr('data-type');
  var $listItemLabel = $listItem.find('.contentListItemLabel');
  $listItemLabel.text(sNewListName);

  if(sListItemType == 'content'){
    var content = applicationData.contentData[sListItemId];
    content.name = sNewListName;
    sNewListName = "Content : " + sNewListName;
  } else if(sListItemType == 'section'){
    var section = applicationData.sectionData[sListItemId];
    section.name = sNewListName;
    sNewListName = "Section : " + sNewListName;
  }
  if(oCurrentlySelectedContent && oCurrentlySelectedContent.id == sListItemId) {
    $('#contentLabel').text(sNewListName);
  }
}