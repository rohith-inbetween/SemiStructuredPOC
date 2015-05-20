var oApplicationData = {};
var aDefaultContentItem = {
  "richTextControl": {id: "richTextControl", name: "Rich Text Editor"},
  "imageControl": {id: "imageControl", name: "Image"}
};

if (localStorage.semiStructuredContentData) {
  oApplicationData = JSON.parse(localStorage.semiStructuredContentData);
} else {
  //oApplicationData = $.extend(true,{},oDefaultData);
}

applicationData = {
  contentData: oApplicationData.contentData || aDefaultContentItem,
  contentNameList: oApplicationData.contentNameList || []
};
function clearStorage () {
  localStorage.clear();
  applicationData.contentData = aDefaultContentItem;
  applicationData.contentNameList = [];
}

$(window).unload(function () {
  localStorage.semiStructuredContentData = JSON.stringify(applicationData);
});