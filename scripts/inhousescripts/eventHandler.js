function createTextEditorInContainer($element){

    var $newEditorDiv = $('<div class="right-container-dropped-text-field">');
    $element.append($newEditorDiv);

    $newEditorDiv.editable({inlineMode:false});

}