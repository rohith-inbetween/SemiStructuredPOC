var oApplicationData = {};

if (localStorage.semiStructuredContentData) {
  oApplicationData = JSON.parse(localStorage.semiStructuredContentData);
} else {
  //oApplicationData = $.extend(true,{},oDefaultData);
}

applicationData = {
  contentData: oApplicationData.contentData || {},
  contentNameList: oApplicationData.contentNameList || []
};
function clearStorage () {
  localStorage.clear();
  applicationData.contentData = {};
  applicationData.contentNameList = [];
}

$(window).unload(function () {
  localStorage.semiStructuredContentData = JSON.stringify(applicationData);
});