var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
  };

function escapeHTML(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

function parse(string) {

    var link = string.indexOf('[link]');
    var linkEnd = string.indexOf('[/link]');


    if (link != -1) {
        if (linkEnd != -1) {

            if(string.substring(link + 6,linkEnd).substring(0,4).toLowerCase() == 'http') {
                linkedString = string.replace('[link]','<a href="');
            }
            else {
                linkedString = string.replace('[link]','<a href="https://');
            }


            linkedString = linkedString.replace('[/link]','" target="_blank">' + string.substring(link + 6,linkEnd) + '</a>');

            string = linkedString;

        }

    }

    var code = string.indexOf('[code]');
    var codeEnd = string.indexOf('[/code]');

    if (code != -1) {
        if (codeEnd != -1) {

            var codeMod = '';
            codeMod = string.substring(code,codeEnd + 7);
            console.log(codeMod);
            codeClean = codeMod.replace('[code]',' ');
            codeClean = codeClean.replace('[/code]',' ');
            string = string.replace(codeMod, '<code><pre>' + escapeHTML(codeClean) + '</code></pre>');

        }
    }

    var image = string.indexOf('[image]');
    var imageEnd = string.indexOf('[/image]');

    if (image != -1) {
        if (imageEnd != -1) {

            var imageMod = '';
            imageMod = string.substring(image,imageEnd + 8);
            console.log(imageMod);
            imageClean = imageMod.replace('[image]',' ');
            imageClean = imageClean.replace('[/image]',' ');
            string = string.replace(imageMod, '<a href="' + escapeHTML(imageClean) + '" target="_blank"><img src="' + escapeHTML(imageClean) + '" onerror="this.style.display=\'none\'"></a>');

        }
    }
        return string;

}
