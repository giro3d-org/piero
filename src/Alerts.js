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
