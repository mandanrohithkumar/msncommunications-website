/**
 * Mobile-Only Exit Confirmation Popup
 * 
 * Features:
 * - Triggers ONLY on mobile devices (width <= 768px OR mobile user agent)
 * - Intercepts browser Back button on mobile
 * - Can also be triggered via data-exit-trigger buttons or MobileExitPopup.open()
 * - Clean white card with circular logo and side-by-side Cancel & Exit buttons
 */

(function () {
  'use strict';

  // Configurable options
  const DEFAULT_OPTIONS = {
    title: 'Do you want to exit?',
    subtitle: 'Your active session will be ended.',
    cancelText: 'Cancel',
    exitText: 'Exit',
    logoSrc: null, // Custom image URL if provided, otherwise default SVG shield emblem
    onExit: function () {
      // Default exit action: navigate back or close
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    },
    onCancel: function () {
      console.log('Mobile exit modal cancelled.');
    }
  };

  /**
   * Mobile detection logic:
   * Returns true ONLY if screen width <= 768px OR user agent matches mobile devices
   */
  function isMobileDevice() {
    const hasMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isNarrowViewport = window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches;
    return hasMobileUA || isNarrowViewport;
  }

  // Inject modal into DOM if not present
  function initModal(options) {
    const settings = Object.assign({}, DEFAULT_OPTIONS, options || {});
    let modal = document.getElementById('mobile-exit-modal');

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'mobile-exit-modal';
      modal.className = 'mobile-exit-modal-overlay';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'mobile-exit-title');

      const logoContent = settings.logoSrc
        ? `<img src="${settings.logoSrc}" alt="Logo" class="mobile-exit-logo-img" />`
        : `<svg class="mobile-exit-logo-img" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M24 4L40 9.8V22.5C40 33 33 40.8 24 44C15 40.8 8 33 8 22.5V9.8L24 4Z" fill="url(#brandGradient)" />
            <path d="M24 8.5L36 12.8V22C36 30 30.5 36.2 24 39C17.5 36.2 12 30 12 22V12.8L24 8.5Z" fill="#1E3A8A" fill-opacity="0.25" />
            <path d="M18 29V20C18 16.7 20.7 14 24 14C27.3 14 30 16.7 30 20V29" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
            <circle cx="24" cy="22" r="2.2" fill="#60A5FA" />
            <defs>
              <linearGradient id="brandGradient" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                <stop stop-color="#0F2744" />
                <stop offset="0.5" stop-color="#1E3A8A" />
                <stop offset="1" stop-color="#2563EB" />
              </linearGradient>
            </defs>
          </svg>`;

      modal.innerHTML = `
        <div class="mobile-exit-modal-card">
          <div class="mobile-exit-logo-circle">
            ${logoContent}
          </div>
          <h2 id="mobile-exit-title" class="mobile-exit-title">${settings.title}</h2>
          ${settings.subtitle ? `<p class="mobile-exit-subtitle">${settings.subtitle}</p>` : ''}
          <div class="mobile-exit-actions">
            <button type="button" class="mobile-exit-btn mobile-exit-btn-cancel" id="mobile-exit-btn-cancel">
              ${settings.cancelText}
            </button>
            <button type="button" class="mobile-exit-btn mobile-exit-btn-confirm" id="mobile-exit-btn-confirm">
              ${settings.exitText}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    }

    const btnCancel = modal.querySelector('#mobile-exit-btn-cancel');
    const btnConfirm = modal.querySelector('#mobile-exit-btn-confirm');

    function open(forcePreview) {
      // Verification: ONLY trigger on mobile unless forcePreview is true
      if (!isMobileDevice() && !forcePreview) {
        console.warn('MobileExitPopup: Ignored because current device is desktop (>768px).');
        return false;
      }

      modal.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      return true;
    }

    function close() {
      modal.classList.remove('is-active');
      document.body.style.overflow = '';
      if (typeof settings.onCancel === 'function') {
        settings.onCancel();
      }
    }

    if (btnCancel) {
      btnCancel.onclick = function (e) {
        e.stopPropagation();
        close();
      };
    }

    if (btnConfirm) {
      btnConfirm.onclick = function (e) {
        e.stopPropagation();
        modal.classList.remove('is-active');
        document.body.style.overflow = '';
        if (typeof settings.onExit === 'function') {
          settings.onExit();
        }
      };
    }

    // Close on overlay backdrop tap
    modal.onclick = function (e) {
      if (e.target === modal) {
        close();
      }
    };

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-active')) {
        close();
      }
    });

    // Auto-bind any button or link with data-exit-trigger="true"
    document.addEventListener('click', function (e) {
      const trigger = e.target.closest('[data-exit-trigger="true"]');
      if (trigger) {
        if (isMobileDevice()) {
          e.preventDefault();
          e.stopPropagation();
          open();
        }
      }
    });

    // Intercept mobile browser back button
    if (window.history && window.history.pushState) {
      try {
        window.history.pushState({ mobileExitTrap: true }, document.title, window.location.href);
        window.addEventListener('popstate', function () {
          if (isMobileDevice()) {
            const opened = open();
            if (opened) {
              window.history.pushState({ mobileExitTrap: true }, document.title, window.location.href);
            }
          }
        });
      } catch (err) {
        // history trap silent catch
      }
    }

    return {
      open: open,
      close: close,
      isMobile: isMobileDevice,
      setOptions: function (newOpts) {
        Object.assign(settings, newOpts);
      }
    };
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.MobileExitPopup = initModal();
    });
  } else {
    window.MobileExitPopup = initModal();
  }

})();
