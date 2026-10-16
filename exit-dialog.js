/**
 * Exit Confirmation Dialog with Multi-Colored Glowing Circle
 * 
 * Features:
 * 1. Exit-Intent Detection: Triggers when the cursor moves towards the top of the viewport (closing tab / window / URL bar).
 * 2. Link Navigation Interception: Prompts user before leaving via external or outgoing links.
 * 3. Mobile Back-Button Support: Catches browser back navigation using popstate.
 * 4. beforeunload Defense-in-depth: Protects against hard reloads and window closes.
 * 5. Full Keyboard (ESC) and Focus Management.
 * 6. "Leave" allows exit / navigation; "Cancel" dismisses and resumes normal browsing.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ExitDialog = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Default configuration
  const DEFAULTS = {
    title: 'Are you sure you want to leave?',
    desc: 'You may have unsaved changes or active progress. Are you sure you want to exit and leave this page?',
    cancelText: 'Cancel',
    leaveText: 'Leave',
    enableExitIntent: true,       // Trigger when cursor moves to top edge (desktop)
    enableLinkIntercept: true,    // Intercept outgoing links on page
    enableMobileBackIntercept: true, // Intercept mobile back-swipe/back-button
    enableBeforeUnload: true,     // Native beforeunload fallback prompt
    sensitivity: 15,              // Pixels from top edge to trigger exit intent
    triggerOnce: false,           // Show only once per session if true
    onLeave: null,                // Custom leave callback
    onCancel: null                // Custom cancel callback
  };

  class ExitConfirmationDialog {
    constructor(options = {}) {
      this.config = Object.assign({}, DEFAULTS, options);
      this.isOpen = false;
      this.hasTriggered = false;
      this.pendingNavigationUrl = null;
      this.isExiting = false;

      // Bound handlers for cleanup
      this._handleMouseLeave = this._handleMouseLeave.bind(this);
      this._handleMouseMove = this._handleMouseMove.bind(this);
      this._handleLinkClick = this._handleLinkClick.bind(this);
      this._handlePopState = this._handlePopState.bind(this);
      this._handleBeforeUnload = this._handleBeforeUnload.bind(this);
      this._handleKeyDown = this._handleKeyDown.bind(this);

      this._init();
    }

    /**
     * Initializes the DOM elements and event listeners
     */
    _init() {
      // Avoid initializing on server-side
      if (typeof window === 'undefined' || typeof document === 'undefined') return;

      this._injectDOM();
      this.bindEvents();
    }

    /**
     * Creates and injects the modal markup into document.body
     */
    _injectDOM() {
      let overlay = document.getElementById('exit-modal-overlay');

      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'exit-modal-overlay';
        overlay.className = 'exit-modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'exit-modal-title');
        overlay.setAttribute('aria-describedby', 'exit-modal-desc');

        overlay.innerHTML = `
          <div class="exit-modal-wrapper">
            <!-- Multi-colored blurred glowing circle background -->
            <div class="exit-glow-circle" aria-hidden="true"></div>
            <div class="exit-glow-circle-inner" aria-hidden="true"></div>

            <!-- Centered modal card overlaid on the glowing circle -->
            <div class="exit-modal-card">
              <button type="button" class="exit-close-btn" id="exit-btn-close" aria-label="Close dialog">&times;</button>
              
              <div class="exit-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>

              <h2 id="exit-modal-title" class="exit-title">${this.config.title}</h2>
              <p id="exit-modal-desc" class="exit-desc">${this.config.desc}</p>

              <div class="exit-actions">
                <button type="button" class="exit-btn exit-btn-cancel" id="exit-btn-cancel">
                  ${this.config.cancelText}
                </button>
                <button type="button" class="exit-btn exit-btn-leave" id="exit-btn-leave">
                  <span>${this.config.leaveText}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(overlay);
      }

      this.overlay = overlay;
      this.btnCancel = overlay.querySelector('#exit-btn-cancel');
      this.btnLeave = overlay.querySelector('#exit-btn-leave');
      this.btnClose = overlay.querySelector('#exit-btn-close');

      // Bind button click events
      this.btnCancel.addEventListener('click', () => this.cancel());
      this.btnClose.addEventListener('click', () => this.cancel());
      this.btnLeave.addEventListener('click', () => this.leave());

      // Click outside modal card to cancel
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.cancel();
        }
      });
    }

    /**
     * Attach all trigger event listeners
     */
    bindEvents() {
      // 1. Mouse movement towards top edge / exit intent
      if (this.config.enableExitIntent) {
        document.addEventListener('mouseleave', this._handleMouseLeave);
        document.addEventListener('mousemove', this._handleMouseMove);
      }

      // 2. Outgoing link intercept
      if (this.config.enableLinkIntercept) {
        document.addEventListener('click', this._handleLinkClick, true);
      }

      // 3. Mobile Back-button intercept via History API
      if (this.config.enableMobileBackIntercept) {
        // Push duplicate state to intercept back
        if (window.history && window.history.pushState) {
          window.history.pushState({ exitProtected: true }, document.title, window.location.href);
          window.addEventListener('popstate', this._handlePopState);
        }
      }

      // 4. Native beforeunload listener
      if (this.config.enableBeforeUnload) {
        window.addEventListener('beforeunload', this._handleBeforeUnload);
      }

      // 5. ESC Key Listener
      document.addEventListener('keydown', this._handleKeyDown);
    }

    /**
     * Trigger when mouse exits document from top edge
     */
    _handleMouseLeave(e) {
      if (this.isExiting) return;
      if (this.config.triggerOnce && this.hasTriggered) return;

      // Detect cursor leaving near top of viewport (towards tabs / close button)
      if (e.clientY <= this.config.sensitivity) {
        this.open();
      }
    }

    /**
     * Detect rapid movement towards the top edge
     */
    _handleMouseMove(e) {
      if (this.isExiting) return;
      if (this.config.triggerOnce && this.hasTriggered) return;

      // If user cursor is within top 25px and moving upwards
      if (e.clientY <= 25 && e.movementY < -8) {
        this.open();
      }
    }

    /**
     * Intercept clicks on links that leave current page
     */
    _handleLinkClick(e) {
      if (this.isExiting) return;
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      // Normal navigation destination
      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        // If navigating to different page or different origin
        if (targetUrl.pathname !== currentUrl.pathname || targetUrl.origin !== currentUrl.origin) {
          e.preventDefault();
          e.stopPropagation();
          this.pendingNavigationUrl = anchor.href;
          this.open();
        }
      } catch (err) {
        // Fallback for relative paths
      }
    }

    /**
     * Intercept mobile back button
     */
    _handlePopState(e) {
      if (this.isExiting) return;

      // Back button was pressed
      this.pendingNavigationUrl = 'BACK_BUTTON';
      this.open();

      // Push state back so page doesn't immediately exit
      if (!this.isExiting) {
        window.history.pushState({ exitProtected: true }, document.title, window.location.href);
      }
    }

    /**
     * Native beforeunload fallback prompt
     */
    _handleBeforeUnload(e) {
      if (this.isExiting) return;

      // Note: Browsers display their own standard dialog for beforeunload
      e.preventDefault();
      e.returnValue = '';
      return '';
    }

    /**
     * Close on ESC key
     */
    _handleKeyDown(e) {
      if (e.key === 'Escape' && this.isOpen) {
        this.cancel();
      }
    }

    /**
     * Open the Exit Dialog
     */
    open(customOptions = {}) {
      if (this.isOpen || this.isExiting) return;

      if (customOptions.pendingUrl) {
        this.pendingNavigationUrl = customOptions.pendingUrl;
      }

      this.isOpen = true;
      this.hasTriggered = true;
      this.overlay.classList.add('active');

      // Trap focus
      setTimeout(() => {
        if (this.btnCancel) this.btnCancel.focus();
      }, 50);
    }

    /**
     * User clicks Cancel: close modal and let user continue browsing smoothly
     */
    cancel() {
      if (!this.isOpen) return;

      this.isOpen = false;
      this.pendingNavigationUrl = null;
      this.overlay.classList.remove('active');

      if (typeof this.config.onCancel === 'function') {
        this.config.onCancel();
      }
    }

    /**
     * User clicks Leave: allow the page to exit or navigate away
     */
    leave() {
      this.isExiting = true;
      this.isOpen = false;
      this.overlay.classList.remove('active');

      // Remove beforeunload listener so browser allows smooth exit
      window.removeEventListener('beforeunload', this._handleBeforeUnload);

      if (typeof this.config.onLeave === 'function') {
        this.config.onLeave();
      }

      // Execute pending navigation
      if (this.pendingNavigationUrl) {
        if (this.pendingNavigationUrl === 'BACK_BUTTON') {
          window.history.back();
        } else {
          window.location.href = this.pendingNavigationUrl;
        }
      } else {
        // If no explicit link was clicked, allow closing or go back
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.close();
        }
      }
    }

    /**
     * Update texts dynamically
     */
    setContent({ title, desc, cancelText, leaveText }) {
      if (title) {
        const el = this.overlay.querySelector('#exit-modal-title');
        if (el) el.textContent = title;
      }
      if (desc) {
        const el = this.overlay.querySelector('#exit-modal-desc');
        if (el) el.textContent = desc;
      }
      if (cancelText) {
        if (this.btnCancel) this.btnCancel.textContent = cancelText;
      }
      if (leaveText) {
        const span = this.btnLeave.querySelector('span');
        if (span) span.textContent = leaveText;
      }
    }

    /**
     * Destroy dialog and unbind all listeners
     */
    destroy() {
      document.removeEventListener('mouseleave', this._handleMouseLeave);
      document.removeEventListener('mousemove', this._handleMouseMove);
      document.removeEventListener('click', this._handleLinkClick, true);
      window.removeEventListener('popstate', this._handlePopState);
      window.removeEventListener('beforeunload', this._handleBeforeUnload);
      document.removeEventListener('keydown', this._handleKeyDown);

      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }
    }
  }

  // Create default singleton instance
  let defaultInstance = null;

  return {
    init: function (options) {
      if (!defaultInstance) {
        defaultInstance = new ExitConfirmationDialog(options);
      }
      return defaultInstance;
    },
    open: function (opts) {
      if (!defaultInstance) this.init();
      defaultInstance.open(opts);
    },
    cancel: function () {
      if (defaultInstance) defaultInstance.cancel();
    },
    leave: function () {
      if (defaultInstance) defaultInstance.leave();
    },
    getInstance: function () {
      return defaultInstance;
    }
  };
});

// Auto-initialize when document is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (!window.ExitDialogInstance) {
        window.ExitDialogInstance = window.ExitDialog.init();
      }
    });
  } else {
    if (!window.ExitDialogInstance) {
      window.ExitDialogInstance = window.ExitDialog.init();
    }
  }
}
