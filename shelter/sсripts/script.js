// render cards & slider
const mainCardsEl = document.querySelector('#main-cards');
const ourPetsCardsEl = document.querySelector('#our-pets-cards');
const overlayForCardsDebounceMs = 450;
let sliderBusy = false;
let sliderTimer = null;


if (mainCardsEl) {
    fetch('./pets.json')
        .then(response => response.json())
        .then(result => {
            const allPets = result;
            let lastGroupIds = new Set();
            let currentGroupIds = new Set();
            let currentStartIndex = 0;
            let animating = false;

            const prevArrowEl = document.querySelector('.arrow.prev');
            const nextArrowEl = document.querySelector('.arrow.next');

            const getCardsPerPage = () => {
                const w = window.innerWidth;
                if (w <= 480) return 1;
                if (w <= 767) return 2;
                return 3;
            };

            const uniqPick = (count, forbiddenSet) => {
                const available = [];
                for (const pet of allPets) {
                    if (!forbiddenSet.has(pet.id)) available.push(pet);
                }

                const shuffled = available
                    .slice()
                    .sort(() => Math.random() - 0.5);

                const picks = [];
                for (const pet of shuffled) {
                    if (picks.length >= count) break;
                    if (forbiddenSet.has(pet.id)) continue;
                    picks.push(pet);
                }

                if (picks.length < count) {
                    const remaining = allPets
                        .filter(p => !picks.some(x => x.id === p.id));
                    for (const pet of remaining) {
                        if (picks.length >= count) break;
                        if (!forbiddenSet.has(pet.id) || picks.length === count) {
                            picks.push(pet);
                        }
                    }
                }

                return picks.slice(0, count);
            };

            const setGroup = (petsGroup) => {
                mainCardsEl.innerHTML = '';
                for (let i = 0; i < petsGroup.length; i++) {
                    const pet = petsGroup[i];
                    const idx = allPets.findIndex(p => p.id === pet.id);
                    createCards(mainCardsEl, idx, allPets);
                }
            };

            const animateAndSwitch = (dir) => {
                if (animating) return;
                animating = true;

                const perPage = getCardsPerPage();


                mainCardsEl.style.transition = 'all 0.2s ease-out';
                mainCardsEl.style.transform = 'translateX(0)';
                mainCardsEl.style.opacity = '0';

                const fadeOutMs = 140;
                clearTimeout(sliderTimer);
                sliderTimer = setTimeout(() => {
                    const nextGroup = uniqPick(perPage, currentGroupIds);
                    currentGroupIds = new Set(nextGroup.map(p => p.id));

                    setGroup(nextGroup);
                    mainCardsEl.style.opacity = '1';
                    mainCardsEl.style.transform = 'translateX(0)';

                    requestAnimationFrame(() => {
                        mainCardsEl.style.opacity = '1';
                        animating = false;
                    });
                }, fadeOutMs);
            };

            const init = () => {
                const perPage = getCardsPerPage();
                const firstGroup = uniqPick(perPage, new Set());
                currentGroupIds = new Set(firstGroup.map(p => p.id));
                setGroup(firstGroup);
                lastGroupIds = new Set(currentGroupIds);

                if (prevArrowEl) prevArrowEl.addEventListener('click', () => animateAndSwitch(-1));
                if (nextArrowEl) nextArrowEl.addEventListener('click', () => animateAndSwitch(1));
            };

            window.addEventListener('resize', () => {
                if (animating) return;
                const perPage = getCardsPerPage();
                const group = uniqPick(perPage, new Set());
                currentGroupIds = new Set(group.map(p => p.id));
                setGroup(group);
                lastGroupIds = new Set(currentGroupIds);
            });

            init();
        });
} else {
    fetch('./pets.json')
        .then(response => response.json())
        .then(result => {
            ourPetsCardsEl.innerHTML = '';
            for (let i = 0; i < result.length; i++) {
                createCards(ourPetsCardsEl, i, result);
            }
        });
}

// modal
const bodyEl = document.querySelector('body');
const cardsEl = document.querySelector('#main-cards');
const petsCardsEl = document.querySelector('#our-pets-cards');
const modalEl = document.querySelector('.modal');
const modalWrapperEl = document.querySelector('.modal__wrapper');
const closeMainEl = document.querySelector('#close-main');
const closeOurPetsEl = document.querySelector('#close-pets');

document.addEventListener('DOMContentLoaded', () => {
    (cardsEl) ? renderModal(cardsEl) : renderModal(petsCardsEl);
});

if (closeMainEl) {
    closeMainEl.addEventListener('click', (e) => {
        e.preventDefault();
        modalEl.classList.remove('show');
        bodyEl?.classList.remove('active');
    });
}

if (closeOurPetsEl) {
    closeOurPetsEl.addEventListener('click', (e) => {
        e.preventDefault();
        modalEl.classList.remove('show');
        bodyEl?.classList.remove('active');
    });
}

modalEl.addEventListener('click', (e) => {
    if (!e.target.closest('.modal__content')) {
        modalEl.classList.remove('show');
        bodyEl?.classList.remove('active');
    }
});

// burger menu

const menuEl = document.querySelector('.menu');
const burgerEl = document.querySelector('.burger');
const menuItemEls = document.querySelectorAll('.menu__item');
const overlayEl = document.querySelector('.header__overlay');
let isOpenMenu = false;

if (burgerEl && menuEl && bodyEl && overlayEl) {
    bodyEl.classList.remove('active');
    menuEl.classList.remove('active');
    burgerEl.classList.remove('active');
    overlayEl.setAttribute('aria-hidden', 'true');
    isOpenMenu = false;

    const closeMenu = () => {
        burgerEl.classList.remove('active');
        menuEl.classList.remove('active');
        bodyEl.classList.remove('active');
        overlayEl.setAttribute('aria-hidden', 'true');
        isOpenMenu = false;
    };

    burgerEl.addEventListener('click', () => {
        if (!isOpenMenu) {
            burgerEl.classList.add('active');
            bodyEl.classList.add('active');
            overlayEl.setAttribute('aria-hidden', 'false');

            isOpenMenu = true;
        } else {
            menuEl.classList.remove('active');
            burgerEl.classList.remove('active');

            setTimeout(() => {
                bodyEl.classList.remove('active');
                overlayEl.setAttribute('aria-hidden', 'true');
            }, 250);

            isOpenMenu = false;
        }
    });

    overlayEl.addEventListener('click', () => {
        if (isOpenMenu) closeMenu();
    });

    menuItemEls.forEach(elem => {
        elem.addEventListener('click', (e) => {
            const target = e.target.closest('a');
            if (!target) return;
            closeMenu();
        });
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 767) closeMenu();
    });
}

function renderModal(elem) {
    elem.addEventListener('click', (e) => {
        modalEl.classList.add('show');
        let index = e.target.closest('.card')?.id;
        if (!index) return;

        fetch('./pets.json')
            .then(response => response.json())
            .then(result => {
                modalWrapperEl.innerHTML = '';
                modalWrapperEl.innerHTML = `
                <div class="modal__img">
                    <img src="./images/pets/pets-${result[index - 1].name}.jpg" alt=${result[index - 1].name}>
                </div>
                <div class="modal__descr">
                    <div class="modal__title">${result[index - 1].name}</div>
                    <div class="modal__subtitle">${result[index - 1].type} - ${result[index - 1].breed}</div>
                    <p class="modal__text">${result[index - 1].description}</p>
                    <ul class="modal__list">
                        <li><span>Age: </span> ${result[index - 1].age}</li>
                        <li><span>Inoculations:</span> ${result[index - 1].inoculations.join(', ')}</li>
                        <li><span>Diseases:</span> ${result[index - 1].diseases.join(', ')}</li>
                        <li><span>Parasites:</span> ${result[index - 1].parasites.join(', ')}</li>
                    </ul>
                </div>
            `;
            });
    });
}

function createCards(parent, index, arr) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.id = arr[index].id;
    card.innerHTML = `
        <img src="./images/pets/pets-${arr[index].name}.jpg" alt=${arr[index].name}>
        <div>${arr[index].name}</div>
        <button>Learn more</button>
        `;
    parent.append(card);
}

