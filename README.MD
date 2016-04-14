#RZFormWidget

Webform view Widget  

##Dependencies:
RZClientEngine >=0.0.1;
##Installation:
```html
Bower:
bower install rzformwidget
```
##Usage:

```html
html:
<div id="elementID"></div>

Javascript:
var params = {...}
var widgetInstance = ruteZangada.renderWidget("Form", "elementID", params);
```
##Params
    var params = {
        //global params
        renderer: "default",            //form renderer["default","grid-row","v-grid"]
        fields: formFields,             //form fields definition
        
        //Default renderer specific params
        horizontal : false,             //Define if form label will be positioned vertically or horizontally
        formLabelSizeClass:"col-sm-2",  //Size of form label area (only if form in horizontal mode)
        formValueSizeClass:"col-sm-10", //Size of  form value area (only if form in horizontal mode)
        
        //v-grid renderer specific params
        displayHeader : false,          //if true, display header row of table
        headerLabel:"Label",            //Label column header
        headerValue:"Value"             //Value column header
    };

##Operations and events
For a complete list of widget operations and events, see the src/InterfaceAndEvents.js file 