var SuperFeedbackForm = function(settings) {

    var self = this;
    var $    = jQuery;

    self.settings = settings;

    self.attach = function() {
		self.container = (settings.container) ? $(settings.container) : $('<div id="sfb-form" class="' + self.settings.positionClass + '" style="display: none"></div>').appendTo('body');
        self.container.html(self.render());
        self.drawContainer      = self.container.find('.sfb-form-drawing-container');
        self.drawInfo           = self.container.find('#sfb-form-drawing-info');
        self.startDrawButton    = self.container.find('#sfb-enable');
        self.stopDrawButton     = self.container.find('#sfb-disable');
        self.submitButton       = self.container.find('#sfb-submit');
        self.cancelButton       = self.container.find('#sfb-cancel');
        self.sendingIndicator   = self.container.find('#sfb-form-sending');
        self.contentsContainer  = self.container.find('.sfb-form-contents');
        self.advancedLink       = self.container.find('#sfb-advanced-link');
        self.mailToInput        = self.container.find('#sfb-mail-to-input');
        self.mailCcInput        = self.container.find('#sfb-mail-cc-input');
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

    self.addMailTo = function(address) {
        self.container.find('#sfb-mail-to-input').val(address);
    }

    self.render = function() {
        var html = ''
          +  '<div class="sfb-form-contents">' 
          +  '  <div class="sfb-form-body">'
          +  '      <div class="sfb-form-heading">'
          +  ((self.settings.icon) ? '        <img src="' + self.settings.icon + '"/>' : '')
          +  '        <span>' + self.text('Title') + '</span>'
          +  '      </div>'
          +  '      <div class="sfb-advanced sfb-mail-adr sfb-mail-to" style="display: none">'
          +  '        <span class="sfb-mail-label">' + self.text('MailTo') + '</span>'
          +  '        <input type="email" id="sfb-mail-to-input" />'
          +  '      </div>'
          +  '      <div class="sfb-advanced sfb-mail-adr sfb-mail-cc" style="display: none">'
          +  '        <span class="sfb-mail-label">' + self.text('MailCC') + '</span>'
          +  '        <input type="email" id="sfb-mail-cc-input" />'
          +  '      </div>'
          +  '      <div class="sfb-advanced sfb-mail-help" style="display: none">'
          +  '       Separate e-mail addresses with comma'
          +  '      </div>'
          +  '      <div class="sfb-form-message">'
          +  '        <textarea placeholder="' + self.text('TextAreaPlaceHolder') + '"></textarea>'
          +  '      </div>'
          +  '      <div class="sfb-form-drawing-container">'
          +  '          <div class="sfb-form-drawing-button">'
          +  '          <button id="sfb-enable" class="sfb-btn sfb-btn-warning">' + self.text('DrawButton') + '</button>'
          +  '          </div>'
          +  '          <div class="sfb-form-drawing-text">' + self.text('DrawTeaser') + '</div>'
          +  '      </div>'
          +  '      <div id="sfb-form-drawing-info" class="sfb-alert" style="display: none">'
          +  '          <h4>' + self.text('DrawModeActiveTitle') + '</h4>'
          +  '          <p>' + self.text('DrawTips') + '</p>'
          +  '          <button id="sfb-disable" class="sfb-btn sfb-btn-warning sfb-btn-small">' + self.text('FinishedDrawingButton') + '</button>'
          +  '      </div>'
          +  '  </div>'
          +  '  <div class="sfb-form-footer">'
          +  '      <a id="sfb-advanced-link" ' + (self.settings.hideAdvanced ? 'style="display:none"' : '') + '>' + self.text('AdvancedLinkDisabled') + '</a>'
          +  '      <button class="sfb-btn sfb-btn-primary" id="sfb-submit">' + self.text('SubmitButton') + '</button>'
          +  '      <button class="sfb-btn" id="sfb-cancel" ' + (self.settings.hideCancel ? 'style="display:none"' : '') + '>' + self.text('CancelButton') + '</button>'
          +  '  </div>'
          +  '</div>'
          +  '<div id="sfb-form-sending" style="display: none"></div>';
      return html;
    }

}

var SuperFeedback = function(settings) {

    var self = this;
    var $    = jQuery;

    self.form         = null;
    self.customData   = {};
    self.advancedMode = false;

    self.setup = function(settings) {
        self.settings = $.extend({
            icon:          '../icon.png',
            formFadeSpeed: 200,
            annotate:      {},
            // {url: 'post-to-this-url'} or function()
            submit:        {},
            // callback after submitted
            submitted:     null,
            // top-left, bottom-left, top-right, bottom-right, middle-left, middle-right, top-center, bottom-center
            position:      'bottom-right',
            elementPrefix: 'sfb-'
        }, settings);

		self.settings.texts = $.extend({
            Title:                  'Send us feedback',
            TextAreaPlaceHolder:    'Enter your message...',
            SubmitButton:           'Submit',
            CancelButton:           'Cancel',
            DrawButton:             'Draw',
            FinishedDrawingButton:  'Finished drawing',
            DrawTeaser:             'A picture is worth a thousand words.<br/>Use draw to highlight parts of the page:',
            DrawModeActiveTitle:    'Drawing mode active',
            DrawTips:               'Click and draw rectangle(s) to highlight and comment portions of the page.',
            SendingPleaseWait:      'Sending, please wait...',
            TakingScreenshotPleaseWait: 'Taking screenshot, please wait...',
            SentThankYou:           'Message sent, thank you :-)',
            MailTo:                 'To',
            MailCC:                 'CC',
            AdvancedLinkDisabled:   'Advanced',
            AdvancedLinkEnabled:    'Disable advanced',
        }, settings.texts ? settings.texts : {});

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
			self.populateEmptyMessageFromAnnotations();
            self.form.contentsContainer.hide();
            self.form.container.addClass('sending');
            self.takeScreenshot();
        });
        self.form.cancelButton.on('click', function() {
            self.stop();
        });
        self.form.advancedLink.on('click', function() {
            self.advancedMode = !self.advancedMode;
            if (self.advancedMode) {
                self.form.advancedLink.html(self.settings.texts.AdvancedLinkEnabled);
                self.form.container.find('.sfb-advanced').show();
            } else {
                self.form.advancedLink.html(self.settings.texts.AdvancedLinkDisabled);
                self.form.container.find('.sfb-advanced').hide();
            }
        });
    }

    self.start = function() {
        self.form.container.show();
    }

    self.stop = function() {
        self.annotate.disable();
        self.annotate.reset();
        self.form.textArea.val('');
        self.form.sendingIndicator.hide();
        self.form.container.removeClass('sending').removeClass('sent');
        self.form.contentsContainer.show();
        self.form.container.hide();
        self.feedbackButton.show();
    }

    self.addMailTo = function(address) {
        self.form.addMailTo(address);
    }

    self.addCustomData = function(key, value) {
        if (value === undefined)
            self.customData = (key) ? key : {};
        else
            self.customData[key] = value;
    }

    // =================================================================

    self.getPositionClass = function() {
        return (self.settings.position) ? self.settings.elementPrefix + self.settings.position : '';
    }

    self.initFeedbackButton = function() {
		var style = self.settings.hideButton ? 'style="display: none"' : '';
        self.feedbackButton = $('<a id="sfb-start-button" class="' + self.getPositionClass() + '" ' + style + '>FEEDBACK</a>')
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

    self.getViewport = function() {
        var $w = $(window);
        return {
            l: $w.scrollLeft(),
            t: $w.scrollTop(),
            w: $w.width(),
            h: $w.height()
        }
    }

    self.initFrame = function() {
        var coords = self.getViewport();
        self.frame = $('<div></div>').css({
            position: 'absolute',
            top: coords.t + 'px',
            left: coords.l + 'px',
            height: coords.h + 'px',
            width: coords.w + 'px',
            border: '4px solid #888',
            opacity: 0.7
        }).appendTo('body');
    }

    self.takeScreenshot = function() {
        self.initFrame();
        self.form.sendingIndicator.show();
        self.form.sendingIndicator.html(self.settings.texts.TakingScreenshotPleaseWait);
        html2canvas(document.body, {
            onrendered: function(canvas) {
                self.frame.remove();
                self.form.sendingIndicator.html(self.settings.texts.SendingPleaseWait);
                var data = {
                    url:         document.location.href,
                    userAgent:   navigator.userAgent,
                    message:     self.form.textArea.val(),
                    screenshot:  canvas.toDataURL('image/png'),
                    to:          self.form.mailToInput.val(),
                    cc:          self.form.mailCcInput.val(),
                    custom:      self.customData
                }
                if (typeof(self.settings.submit) == 'function') {
                    self.settings.submit(data, self.submitted);
                } else {
                    $.ajax({
                        type:    'POST',
                        url:     self.settings.submit.url,
                        data:    data,
                        success: function(data) {
                            self.submitted(data);
                        }
                    });
                }
            }
        });
    }

	self.populateEmptyMessageFromAnnotations = function() {
		if (self.form.textArea.val().trim())
			return;
		var texts = self.annotate.getTexts();
		if (!texts || texts.length == 0)
			return;
		self.form.textArea.val(texts[0]);
	}

    self.submitted = function(data) {
        self.annotate.disable();
        self.annotate.reset();
        if (self.settings.submitted)
            self.settings.submitted(data);
        self.form.container.removeClass('sending').addClass('sent');
        self.form.sendingIndicator.html(self.settings.texts.SentThankYou);
        self.form.container.fadeOut(4000, function() {
            self.stop();
        });
    }

    self.setup(settings);

}

