/**
 * Picked object
 *
 * @typedef {object} ToastResult
 * @property {Function} dismiss Function to call to dismiss the toast
 */

/**
 * Displays a toast in the UI.
 *
 * @param {string|HTMLElement} message Message to display
 * @param {?string} [className='danger'] Alert classname (e.g. `danger`, `info`, etc.)
 * - see https://getbootstrap.com/docs/5.3/helpers/color-background/#with-components)
 * @param {boolean} [fadeOut=false] Automatically fades out after 5 seconds.
 * @returns {ToastResult} Object
 */
function showAlert(message, className = 'danger', fadeOut = false) {
    const alert = document.createElement('div');
    alert.className = `toast show fade ${className !== null ? `text-bg-${className}` : ''}`;
    alert.setAttribute('role', 'alert');

    const header = document.createElement('div');
    header.className = 'toast-header';
    header.innerHTML = `
      <strong class="me-auto">Giro3D</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;
    alert.appendChild(header);

    const body = document.createElement('div');
    body.className = 'toast-body';

    if (message instanceof HTMLElement) {
        body.appendChild(message);
    } else {
        body.innerText = message;
    }
    alert.appendChild(body);

    const toasts = document.getElementById('toasts');
    toasts.appendChild(alert);

    const dismiss = () => {
        /** @type {HTMLElement} */
        const btn = header.querySelector('button.btn-close');
        if (btn) btn.click();
        alert.remove();
    };

    if (fadeOut) {
        setTimeout(dismiss, 5000);
    }
    return { dismiss };
}

export default { showAlert };
