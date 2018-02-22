'use strict';

var getUserAgent = navigator.userAgent;
var cashingDocument = document;
var infoAgent = cashingDocument.createElement('div');
infoAgent.innerHTML = getUserAgent;
infoAgent.setAttribute('id','info-agent');
cashingDocument.body.appendChild(infoAgent);
