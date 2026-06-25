// render cards
const mainCardsEl = document.querySelector('#main-cards');
const ourPetsCardsEl = document.querySelector('#our-pets-cards');

if(mainCardsEl) {
    fetch('./pets.json')
        .then(response => response.json())
        .then(result => {
            mainCardsEl.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                let index = Math.floor(Math.random() * result.length);
                createCards (mainCardsEl, index, result);
            }
        } 
    );
} else {
    fetch('./pets.json')
        .then(response => response.json())
        .then(result => {
            ourPetsCardsEl.innerHTML = '';
            for (let i = 0; i < result.length; i++) {
                createCards (ourPetsCardsEl, i, result);
            }
        }
    );
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
    (cardsEl) ? renderModal (cardsEl) : renderModal (petsCardsEl);
});

if(closeMainEl) {
    closeMainEl.addEventListener('click', (e) => {
        e.preventDefault();
        modalEl.classList.remove('show');
        bodyEl.classList.remove('active');
    });
} 

if(closeOurPetsEl) {
    closeOurPetsEl.addEventListener('click', (e) => {
        e.preventDefault();
        modalEl.classList.remove('show');
        bodyEl.classList.remove('active');
    });
}

modalEl.addEventListener('click', (e) => {
    if (!e.target.closest('.modal__content')){
        modalEl.classList.remove('show');
        bodyEl.classList.remove('active');
    }
});

// burger menu

const menuEl = document.querySelector('.menu');
const burgerEl = document.querySelector('.burger');
const menuItemEls = document.querySelectorAll('.menu__item');

burgerEl.addEventListener('click', () => {
    burgerEl.classList.toggle('active');
    menuEl.classList.toggle('active');
    bodyEl.classList.toggle('active');
});

menuItemEls.forEach(elem => {
    elem.addEventListener('click', () => {
        burgerEl.classList.remove('active');
        menuEl.classList.remove('active');
        bodyEl.classList.remove('active');
    });
});

window.addEventListener('resize', () => {
    window.innerWidth > 768 ? bodyEl.classList.remove('active') : bodyEl.classList.add('active');
});


function renderModal (elem) {
    elem.addEventListener('click', (e) => {
        modalEl.classList.add('show');
        let index = e.target.closest('.card').id;
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

function createCards (parent, index, arr) {
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