// render cards & pagination
const mainCardsEl = document.querySelector('#main-cards');
const ourPetsCardsEl = document.querySelector('#our-pets-cards');

const getOurPetsLayout = () => {
    const w = window.innerWidth;
    if (w <= 740) return { perPage: 3, totalPages: 16 };
    if (w <= 940) return { perPage: 6, totalPages: 8 };
    return { perPage: 8, totalPages: 6 };
};

const build48Sequence = (allPetsArr) => {
    const petsById = new Map(allPetsArr.map(p => [p.id, p]));
    const petIds = allPetsArr.map(p => p.id);

    const perPetBase = Math.floor(48 / petIds.length);
    const counts = new Map(petIds.map(id => [id, perPetBase]));

    let remaining = 48 - perPetBase * petIds.length;
    let i = 0;
    while (remaining > 0) {
        const id = petIds[i % petIds.length];
        counts.set(id, counts.get(id) + 1);
        remaining--;
        i++;
    }

    const result = [];
    const left = new Map(counts);
    let lastId = null;

    const tryBuild = () => {
        result.length = 0;
        left.clear();
        counts.forEach((v, k) => left.set(k, v));
        lastId = null;

        while (result.length < 48) {
            const candidates = petIds
                .filter(id => left.get(id) > 0 && id !== lastId)
                .map(id => ({ id, left: left.get(id) }))
                .sort((a, b) => b.left - a.left);

            if (!candidates.length) return false;

            const top = candidates.slice(0, Math.min(3, candidates.length));
            const pick = top[Math.floor(Math.random() * top.length)];

            result.push(petsById.get(pick.id));
            left.set(pick.id, left.get(pick.id) - 1);
            lastId = pick.id;
        }

        for (let j = 1; j < result.length; j++) {
            if (result[j].id === result[j - 1].id) return false;
        }

        return true;
    };

    for (let attempt = 0; attempt < 500; attempt++) {
        if (tryBuild()) return result.slice();
    }

    return result.slice();
};

const createCardsForGroup = (parent, petsGroup, allPetsArr, allPetsIndexMap) => {
    parent.innerHTML = '';
    petsGroup.forEach(pet => {
        const idx = allPetsIndexMap.get(pet.id);
        createCards(parent, idx, allPetsArr);
    });
};

const initOurPetsPagination = async () => {
    if (!ourPetsCardsEl) return;

    const paginationEl = document.querySelector('.pagination');
    if (!paginationEl) return;

    const items = Array.from(paginationEl.querySelectorAll('.pagination__item'));
    const firstBtn = items[0];
    const prevBtn = items[1];
    const indicator = items[2];
    const nextBtn = items[3];
    const lastBtn = items[4];

    const getBtn = (el) => el && el.classList.contains('pagination__item') ? el : el;

    const allPetsArr = await fetch('./pets.json').then(r => r.json());
    const allPetsIndexMap = new Map(allPetsArr.map((p, idx) => [p.id, idx]));

    const seq48 = build48Sequence(allPetsArr);

    let currentPage = 1;
    let busy = false;

    const setDisabled = (el, disabled) => {
        if (!el) return;
        if (disabled) {
            el.classList.add('pagination__disabled');
            el.classList.remove('pagination__active');
            el.style.cursor = 'default';
        } else {
            el.classList.remove('pagination__disabled');
            el.classList.add('pagination__active');
            el.style.cursor = 'pointer';
        }
    };

    const updateControls = (page) => {
        const { totalPages } = getOurPetsLayout();
        setDisabled(firstBtn, page === 1);
        setDisabled(prevBtn, page === 1);
        setDisabled(nextBtn, page === totalPages);
        setDisabled(lastBtn, page === totalPages);
        if (indicator) indicator.textContent = String(page);
    };

    const renderPage = (page) => {
        const { perPage } = getOurPetsLayout();
        currentPage = page;

        const start = (page - 1) * perPage;
        const group = seq48.slice(start, start + perPage);

        ourPetsCardsEl.style.transition = 'opacity 0.2s ease-out';
        ourPetsCardsEl.style.opacity = '0';

        window.setTimeout(() => {
            createCardsForGroup(ourPetsCardsEl, group, allPetsArr, allPetsIndexMap);
            ourPetsCardsEl.style.opacity = '1';
            updateControls(page);
        }, 140);
    };

    const goTo = (page) => {
        if (busy) return;
        const { totalPages } = getOurPetsLayout();
        if (page < 1 || page > totalPages) return;
        busy = true;

        renderPage(page);

        window.setTimeout(() => {
            busy = false;
        }, 220);
    };

    const attachPaginationClick = (el, handler) => {
        if (!el) return;
        el.addEventListener('click', (e) => {
            if (el.classList.contains('pagination__disabled')) {
                e.preventDefault();
                return;
            }
            handler();
        });
    };

    attachPaginationClick(firstBtn, () => goTo(1));
    attachPaginationClick(prevBtn, () => goTo(currentPage - 1));
    attachPaginationClick(nextBtn, () => goTo(currentPage + 1));
    attachPaginationClick(lastBtn, () => goTo(getOurPetsLayout().totalPages));

    if (nextBtn && nextBtn.classList.contains('pagination__active')) {
        nextBtn.onclick = () => goTo(currentPage + 1);
    }

    window.addEventListener('resize', () => {
        const { totalPages } = getOurPetsLayout();
        currentPage = Math.min(currentPage, totalPages);
        renderPage(currentPage);
    });

    renderPage(1);
};

if (ourPetsCardsEl) {
    initOurPetsPagination();
}

if (mainCardsEl) {
    const prevArrowEl = document.querySelector('.arrow.prev');
    const nextArrowEl = document.querySelector('.arrow.next');

    const getPerView = () => {
        const w = window.innerWidth;
        if (w <= 440) return 1;
        if (w <= 900) return 2;
        return 3;
    };


    const shuffle = (arr) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    };

    const buildNextGroup = (allPets, prevGroupIds, count) => {
        const prevSet = new Set(prevGroupIds);
        const candidates = allPets.filter(p => !prevSet.has(p.id));

        const fallback = allPets.filter(p => !prevGroupIds.includes(p.id));
        const source = candidates.length >= count ? candidates : (candidates.concat(fallback));

        const uniqById = new Map();
        source.forEach(p => uniqById.set(p.id, p));

        const selected = shuffle(Array.from(uniqById.values())).slice(0, count);
        return selected;
    };

    fetch('./pets.json')
        .then(response => response.json())
        .then(allPets => {
            let isAnimating = false;
            let currentGroup = [];

            const renderGroup = (group, direction) => {
                const perView = getPerView();
                const groupToRender = group.slice(0, perView);

                mainCardsEl.style.willChange = 'transform, opacity';
                mainCardsEl.style.transition = 'transform 0.25s ease, opacity 0.25s ease';

                const outX = direction === 'next' ? '-30px' : '30px';
                const inX = direction === 'next' ? '30px' : '-30px';

                mainCardsEl.style.opacity = '0';
                mainCardsEl.style.transform = `translateX(${outX})`;

                window.setTimeout(() => {
                    mainCardsEl.innerHTML = '';
                    groupToRender.forEach(p => {
                        const idx = allPets.findIndex(x => x.id === p.id);
                        if (idx !== -1) createCards(mainCardsEl, idx, allPets);
                    });

                    mainCardsEl.style.opacity = '1';
                    mainCardsEl.style.transform = `translateX(${inX})`;

                    window.requestAnimationFrame(() => {
                        mainCardsEl.style.transform = 'translateX(0)';
                    });
                }, 140);
            };

            const nextGroup = (direction) => {
                const count = getPerView();
                const next = buildNextGroup(allPets, currentGroup.map(p => p.id), count);
                return next;
            };

            const go = (direction) => {
                if (isAnimating) return;
                isAnimating = true;

                const next = nextGroup(direction);
                renderGroup(next, direction);
                currentGroup = next;

                window.setTimeout(() => {
                    isAnimating = false;
                }, 300);
            };

            const count0 = getPerView();
            currentGroup = shuffle(allPets).slice(0, count0);
            renderGroup(currentGroup, 'next');

            if (prevArrowEl) prevArrowEl.addEventListener('click', () => go('prev'));
            if (nextArrowEl) nextArrowEl.addEventListener('click', () => go('next'));
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
    overlayEl.classList.remove('active');
    isOpenMenu = false;

    function closeMenu() {
        burgerEl.classList.remove('active');
        menuEl.classList.remove('active');
        bodyEl.classList.remove('active');
        overlayEl.classList.remove('active');
        isOpenMenu = false;
    };



    burgerEl.addEventListener('click', () => {
        if (!isOpenMenu) {
            burgerEl.classList.add('active');
            bodyEl.classList.add('active');
            menuEl.classList.add('active');
            overlayEl.classList.add('active');
            isOpenMenu = true;
        } else {
            menuEl.classList.remove('active');
            bodyEl.classList.remove('active');
            burgerEl.classList.remove('active');
            overlayEl.classList.remove('active');
            isOpenMenu = false;
        }
    });

    overlayEl.addEventListener('click', (e) => {
        if (e.target !== overlayEl) return;
        closeMenu();
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

