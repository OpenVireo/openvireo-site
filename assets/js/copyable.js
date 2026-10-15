async function copyText(e) {
    const btn = e.currentTarget;
    const icon = btn.querySelector('i');
    const textNode = btn.previousElementSibling;
    try {
        await navigator.clipboard.writeText(textNode.textContent);
        icon.classList.replace('fa-copy', 'fa-check');
        btn.title = 'Copied!';
    } catch (err) {
        alert(`Error copying text to clipboard: ${err.message}\n\nPlease copy manually instead.`);
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    setTimeout(() => {
        icon.classList.replace('fa-check', 'fa-copy');
        btn.title = 'Copy to clipboard';
    }, 1000);
}

export function initCopyable() {
    for (const el of document.querySelectorAll('.copyable')) {
        const btn = document.createElement('fluent-button');
        btn.setAttribute('icon-only', '');
        btn.setAttribute('aria-label', 'Copy to clipboard');
        btn.title = 'Copy to clipboard';
        const icon = document.createElement('i');
        icon.classList.add('fa-solid', 'fa-copy');
        icon.setAttribute('aria-hidden', 'true');
        btn.appendChild(icon);
        btn.addEventListener('click', copyText);
        el.appendChild(btn);
    }
}
