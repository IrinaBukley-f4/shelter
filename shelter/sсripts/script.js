// render cards
const mainCardsEl = document.querySelector('#main-cards');
const ourPetsCardsEl = document.querySelector('#our-pets-cards');

fetch('./pets.json')
    .then(response => response.json())
    .then(result => {
        mainCardsEl.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            let index = Math.floor(Math.random() * result.length);
            const card = document.createElement('div');
            card.classList.add('card');
            card.id = result[index].name;
            card.innerHTML = `
                <img src="./images/pets/pets-${result[index].name}.jpg" alt=${result[index].name}>
                <div>${result[index].name}</div>
                <button>Learn more</button>
                `;
            mainCardsEl.append(card);
            result.splice(index, 1);
            }
        } 
    );

// modal
const bodyEl = document.querySelector('body');

document.addEventListener('DOMContentLoaded', () => {
    const cardsEl = document.querySelector('#main-cards');
    const modalEl = document.querySelector('.modal');
    const modalWrapperEl = document.querySelector('.modal__wrapper');
    const closeMainEl = document.querySelector('#close-main');

cardsEl.addEventListener('click', (e) => {
        modalEl.classList.add('show');
        let index = e.target.closest('.card').name;
        fetch('./pets.json')
        .then(response => response.json())
        .then(result => {
                console.log(result);
            modalWrapperEl.innerHTML = '';
            modalWrapperEl.innerHTML = `
            <div class="modal__img">
                <img src="./images/pets/pets-jennifer.jpg" alt="charly">
            </div>
            <div class="modal__descr">
                <div class="modal__title">Jennifer</div>
                <div class="modal__subtitle">Dog - Labrador</div>
                <p class="modal__text">Jennifer is a sweet 2 months old Labrador that is patiently waiting to find a new forever home. This girl really enjoys being able to go outside to run and play, but won't hesitate to play up a storm in the house if she has all of her favorite toys.</p>
                <ul class="modal__list">
                    <li><span>Age: </span> 2 months</li>
                    <li><span>Inoculations:</span> none</li>
                    <li><span>Diseases:</span> none</li>
                    <li><span>Parasites:</span> none</li>
                </ul>
            </div>
            `;
        });
    });
});
if(closeMainEl) {
    closeMainEl.addEventListener('click', (e) => {
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
