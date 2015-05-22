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
  $('body').on('click', '.content-section-expander', null, contentListItemExpanderClicked);
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
    oSectionData.id = GUID.random();
  }
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
    oSectionData.id = GUID.random();
  }
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

  applicationData.contentData[oContentData.id] = oContentData;

  addContentToList(oContentData);
}

function saveContent (oEvent) {
  if (!$(oEvent.target).hasClass('disabled')) {
    computeSectionsData();
    saveSectionData();
    oCurrentlySelectedContent.isDirty = false;
    var $sectionList = createNewSectionsList(oCurrentlySelectedContent.sections);
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

  $("#listdata").searcher({
                            itemSelector: ".contentListItem",
                            textSelector:  ".contentListItemLabel",
                            inputSelector: "#content-search-input"
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
  var $sectionsList = createNewSectionsList(oContent.sections);
  $contentList.append($sectionsList);

  return $contentsListItem;
}

function createNewContentItem (oContent) {
  var $contentListItem = $('<div class="contentListItem '+ oContent.class +'">');
  $contentListItem.addClass('contentListItem ' + oContent.class);
  var sType = oContent.class == "basic-content-element" ? "section" : "content";
  $contentListItem.attr('data-type', sType);
  var $contentLabel = $('<div class = "contentListItemLabel" title="' + oContent.name + '">' + oContent.name + '</div>')
  $contentListItem.append($contentLabel);

  $contentLabel.before('<span class="content-section-expander fa fa-chevron-circle-right"></span>');
  $contentLabel.after('<span class="unsavedContent" style="display: none">*</span>');
  if (!oContent.sections.length) {
    $contentListItem.find('.content-section-expander').css('visibility', 'hidden');
  }
  $contentListItem.attr('data-id', oContent.id);
  $contentListItem.attr('data-name', oContent.name);

  return $contentListItem;
}

function createNewSectionsList (aSections) {
  var $sectionList = $('<div class="sectionList" style="display: none">');

  for (var iIndex = 0; iIndex < aSections.length; iIndex++) {
    var oSectionObj = aSections[iIndex];
    var oSection = applicationData.sectionData[oSectionObj.id];
    var $contentListItem = $('<div class="contentListItem">');
    $contentListItem.attr('data-type', 'section');
    if(oSection.type){
      $contentListItem.attr('data-section-type', oSection.type);
    }
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
    if(sListItemType == 'content'){
      oCurrentlySelectedContent = applicationData.contentData[sListItemId];
      $('#contentLabel').text("Content : " + sListItemName);
      $('#saveContent').removeClass('disabled');
    } else if(sListItemType == 'section'){
      oCurrentlySelectedContent = applicationData.sectionData[sListItemId];
      $('#contentLabel').text("Section : " + sListItemName);
      $('#saveContent').addClass('disabled');
    }
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

  if($element.attr('data-type') == "section"){
    var sSectionId = $element.attr('data-id');
    var sSectionType = $element.attr('data-section-type');
    var oSection = applicationData.sectionData[sSectionId];
    if (sSectionId == "richTextControl" ||
        (sSectionType && sSectionType == "richTextEditor")) {
      appendSeperatorDiv($container);
      createTextEditorInContainer($container, oSection);
      bDataAdded = true;
    } else if (sSectionId == "imageControl" ||
        (sSectionType && sSectionType == "image")) {
      appendSeperatorDiv($container);
      createImageInsertInContainer($container, oSection);
      bDataAdded = true;
    }
  }else if ($element.attr('data-type') == "content") {
    var aSectionsInContent = applicationData.contentData[$element.attr('data-id')].sections;

    if (aSectionsInContent.length > 0) {
      bDataAdded = true;
      for (var iIndex = 0; iIndex < aSectionsInContent.length; iIndex++) {
        var sSectionId = aSectionsInContent[iIndex].id;
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

function contentChangedInEditor (oEvent, $editor) {

}