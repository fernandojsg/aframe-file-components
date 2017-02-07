/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

var saveAs = require('./vendor/saveas.js').saveAs;

AFRAME.registerComponent('downloader', {
  schema: {},

  download: function (value, filename, contentType) {
    switch (contentType) {
      case 'application/json':
        value = [JSON.stringify(value)];
        break;
      default:
        contentType = 'application/octet-library';
    }

    var blob = (value instanceof Blob) ? value : new Blob(value, {type: contentType});
    saveAs(blob, filename);
  }
});

AFRAME.registerComponent('loader', {
  schema: {},

  load: function (url, binary) {
    var loader = new THREE.XHRLoader(this.manager);
    loader.crossOrigin = 'anonymous';
    if (binary === true) {
      loader.setResponseType('arraybuffer');
    }

    var el = this.el;
    loader.load(url, function (buffer) {
      if (binary === true) {
        el.emit('loader-completed', {content: buffer, isBinary: true});
      } else {
        el.emit('loader-completed', {content: JSON.parse(buffer), isBinary: false});
      }
    });
  }
});

AFRAME.registerComponent('uploadcare', {
  schema: {
    publicKey: {default: ''}
  },

  upload: function (value, contentType) {
    switch (contentType) {
      case 'application/json':
        value = [JSON.stringify(value)];
        break;
      default:
        contentType = 'application/octet-library';
    }

    var blob = (value instanceof Blob) ? value : new Blob(value, {type: contentType});
    var file = uploadcare.fileFrom('object', blob);
    var self = this;

    file.done(function (fileInfo) {
      console.log('Uploaded link:', fileInfo.cdnUrl);
      self.el.emit('upload-completed', {url: fileInfo.cdnUrl});
    }).fail(function (errorInfo, fileInfo) {
      self.el.emit('upload-error', {errorInfo: errorInfo, fileInfo: fileInfo});
    }).progress(function (uploadInfo) {
      self.el.emit('upload-progress', {progress: uploadInfo.progress});
    });
  }
});
