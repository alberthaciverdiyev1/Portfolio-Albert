
fetch('/partials/header.html')
    .then(res => res.text())
    .then(html => document.getElementById('header').innerHTML = html);

fetch('/partials/footer.html')
    .then(res => res.text())
    .then(html => document.getElementById('footer').innerHTML = html);

async function fetchVisitorCount() {
    try {
        const res = await fetch('/visitors');
        console.log(res);
        if (!res.ok) throw new Error('Network response was not ok');
        const countText = await res.text();
        console.log({ countText });
        document.getElementById('visitor-count').textContent = 'Ziyarətçi sayı: ' + countText;
    } catch (error) {
        console.error('Visitor count fetch error:', error);
        document.getElementById('visitor-count').textContent = 'Ziyarətçi sayı: N/A';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(fetchVisitorCount, 3000);
});
