var oApplicationData = {};

var oDefaultContentItem = {
  richTextControl: {id: "richTextControl", name: "Rich Text Editor", class: "basic-content-element", sections: []},
  imageControl: {id: "imageControl", name: "Image", class: "basic-content-element", sections: []}
};

var oDefaultSectionData = {
  richTextControlSection: {id: "richTextControlSection", name: "Rich Text Editor", html: "", type: "richTextEditor"},
  imageControlSection: {id: "imageControlSection", name: "Image", imageByte: "", scalingClass: "fitContentToFrame", type: "image"}
};

if (localStorage.semiStructuredContentData) {
  oApplicationData = JSON.parse(localStorage.semiStructuredContentData);
}

applicationData = {
  contentData: oApplicationData.contentData || oDefaultContentItem,
  sectionData: oApplicationData.sectionData || oDefaultSectionData
};

function clearStorage () {
  localStorage.clear();
  applicationData.contentData = oDefaultContentItem;
  applicationData.sectionData = oDefaultSectionData;
}

$(window).unload(function () {
  localStorage.semiStructuredContentData = JSON.stringify(applicationData);
});