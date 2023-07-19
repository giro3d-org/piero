const menu = document.getElementById('menu-container');
const menuLinks = document.querySelectorAll('#menu a');
const menuTabs = document.querySelectorAll('.menutab');

menuLinks.forEach(elt => {
    elt.addEventListener('click', () => {
        if (elt.classList.contains('active')) {
            elt.classList.remove('active');
            document.querySelector(elt.getAttribute('data-target')).classList.add('d-none');
            menu.classList.remove('w-25');
        } else {
            menuLinks.forEach(_elt => _elt.classList.remove('active'));
            elt.classList.add('active');

            menuTabs.forEach(_elt => _elt.classList.add('d-none'));
            document.querySelector(elt.getAttribute('data-target')).classList.remove('d-none');

            menu.classList.add('w-25');
        }
    });
});
