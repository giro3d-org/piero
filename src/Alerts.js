/**
 * Displays an alert in the UI.
 *
 * @param {string} message Message to display
 * @param {string} className Alert classname (see https://getbootstrap.com/docs/5.3/components/alerts/#examples)
 * @param {boolean} [fadeOut=false] Automatically fades out after 5 seconds.
 * @returns {object} Object with btn and dismiss properties
 */
function showAlert(message, className = 'danger', fadeOut = false) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${className} alert-dismissible fade show`;
    alert.setAttribute('role', 'alert');
    alert.innerText = message;
    const btn = document.createElement('button');
    btn.className = 'btn-close';
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-bs-dismiss', 'alert');
    btn.setAttribute('aria-label', 'Close');
    alert.appendChild(btn);

    const alerts = document.getElementById('alerts');
    alerts.appendChild(alert);
    alerts.classList.remove('d-none');

    const dismiss = () => btn.click();

    if (fadeOut) {
        setTimeout(dismiss, 5000);
    }
    return { btn, dismiss };
}

export default { showAlert };
