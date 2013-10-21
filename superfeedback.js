var SuperFeedbackForm = function(settings) {
    var self = this;
    self.settings = settings;

    self.attach = function() {
        self.container = $('<div id="sfb-form" class="' + self.settings.positionClass + '" style="display: none"></div>')
            .html(self.render())
            .appendTo('body');
        self.drawContainer      = self.container.find('.sfb-form-drawing-container');
        self.drawInfo           = self.container.find('#sfb-form-drawing-info');
        self.startDrawButton    = self.container.find('#sfb-enable');
        self.stopDrawButton     = self.container.find('#sfb-disable');
        self.submitButton       = self.container.find('#sfb-submit');
        self.cancelButton       = self.container.find('#sfb-cancel');
        self.sendingIndicator   = self.container.find('#sfb-form-sending');
        self.contentsContainer  = self.container.find('.sfb-form-contents');
        self.textArea           = self.container.find('textarea');
    }

    self.hide = function() {
        self.container.fadeOut(self.settings.formFadeSpeed);
    }

    self.show = function() {
        self.container.fadeIn(self.settings.formFadeSpeed);
    }

    self.setZIndex = function(zIndex) {
        self.container.css({ zIndex: zIndex });
    }

    self.text = function(text) {
        return self.settings.texts[text];
    }

    self.render = function() {
        var html = ''
          +  '<div class="sfb-form-contents">' 
          +  '  <div class="sfb-form-body">'
          +  '      <div class="sfb-form-heading">'
          +  '      <img src="' + self.settings.icon + '"/>'
          +  '      <span>' + self.text('Title') + '</span>'
          +  '      </div>'
          +  '      <div class="sfb-form-message">'
          +  '        <textarea placeholder="' + self.text('TextAreaPlaceHolder') + '"></textarea>'
          +  '      </div>'
          +  '      <div class="sfb-form-drawing-container">'
          +  '          <div class="sfb-form-drawing-button">'
          +  '          <button id="sfb-enable" class="btn btn-warning">' + self.text('DrawButton') + '</button>'
          +  '          </div>'
          +  '          <div class="sfb-form-drawing-text">' + self.text('DrawTeaser') + '</div>'
          +  '      </div>'
          +  '      <div id="sfb-form-drawing-info" class="alert" style="display: none">'
          +  '          <h4>' + self.text('DrawModeActiveTitle') + '</h4>'
          +  '          <p>' + self.text('DrawTips') + '</p>'
          +  '          <button id="sfb-disable" class="btn btn-warning btn-small">' + self.text('FinishedDrawingButton') + '</button>'
          +  '      </div>'
          +  '  </div>'
          +  '  <div class="sfb-form-footer">'
          +  '      <button class="btn btn-primary" id="sfb-submit">' + self.text('SubmitButton') + '</button>'
          +  '      <button class="btn" id="sfb-cancel">' + self.text('CancelButton') + '</button>'
          +  '  </div>'
          +  '</div>'
          +  '<div id="sfb-form-sending" style="display: none">' + self.text('SendingPleaseWait') + '</div>';
      return html;
    }

}

var SuperFeedback = function(settings) {
    var self = this;
    self.form = null;

    self.setup = function(settings) {
        self.settings = $.extend({
            icon:          '../icon-small.png',
            formFadeSpeed: 200,
            annotate:      {},
            // {url: 'post-to-this-url'} or function()
            submit:        {},
            // callback after submitted
            submitted:     null,
            // top-left, bottom-left, top-right, bottom-right, middle-left, middle-right, top-center, bottom-center
            position:      'bottom-right',
            elementPrefix: 'sfb-',
            texts:         {
                Title:                  'Send us feedback',
                TextAreaPlaceHolder:    'Enter your message...',
                SubmitButton:           'Submit',
                CancelButton:           'Cancel',
                DrawButton:             'Draw',
                FinishedDrawingButton:  'Finished drawing',
                DrawTeaser:             'A picture is worth a thousand words.<br/>Use draw to highlight parts of the page:',
                DrawModeActiveTitle:    'Drawing mode active',
                DrawTips:               'Click and draw rectangle(s) to highlight and comment portions of the page.',
                SendingPleaseWait:      'Sending, please wait...'
            }
        }, settings);

        self.initFeedbackButton();

        self.settings.positionClass = self.getPositionClass();
        self.form = new SuperFeedbackForm(self.settings);
        self.form.attach();
        self.initAnnotate();

        self.form.startDrawButton.on('click', function() {
            self.annotate.enable();
        });
        self.form.stopDrawButton.on('click', function() {
            self.annotate.disable();
        });
        self.form.submitButton.on('click', function() {
            self.annotate.disable();
            self.form.contentsContainer.hide();
            self.form.sendingIndicator.show();
            self.form.container.addClass('sending');
            self.takeScreenshot();
        });
        self.form.cancelButton.on('click', function() {
            self.annotate.disable();
            self.annotate.reset();
            self.form.textArea.val('');
            self.form.container.hide();
            self.feedbackButton.show();
        });
    }

    self.start = function() {
        self.form.container.show();
    }

    self.getPositionClass = function() {
        return (self.settings.position) ? self.settings.elementPrefix + self.settings.position : '';
    }

    self.initFeedbackButton = function() {
        self.feedbackButton = $('<a id="sfb-start-button" class="' + self.getPositionClass() + '">FEEDBACK</a>')
            .on('click', function() {
                self.feedbackButton.hide();
                self.start();
            })
            .appendTo('body');
    }

    self.initAnnotate = function() {
        self.annotate = new Annotate(self.settings.annotate);
        self.annotate.on('enabled', function(options) {
            self.form.setZIndex(options.zIndex+3);
            self.form.drawContainer.hide();
            self.form.drawInfo.show();
        });
        self.annotate.on('disabled', function() {
            self.form.drawContainer.show();
            self.form.drawInfo.hide();
        });
        self.annotate.on('draw', function() {
            self.form.hide();
        });
        self.annotate.on('drawn', function() {
            self.form.show();
        });
    }

    self.takeScreenshot = function() {
        html2canvas(document.body, {
            onrendered: function(canvas) {
                var data = {
                    url:         document.location.href,
                    userAgent:   navigator.userAgent,
                    message:     self.form.textArea.val(),
                    screenshot:  canvas.toDataURL('image/jpeg')
                }
                if (typeof(self.settings.submit) == 'function') {
                    self.settings.submit(data);
                } else {
                    $.ajax({
                        type:    'POST',
                        url:     self.settings.submit.url,
                        data:    data,
                        success: function(data) {
                            self.annotate.reset();
                            self.form.container.remove();
                            if (self.settings.submitted)
                                self.settings.submitted(data);
                        }
                    });
                }
            }
        });
    }

    self.setup(settings);

}
