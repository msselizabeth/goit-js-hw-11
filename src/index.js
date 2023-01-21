import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { getImages } from './fetch-images';
import { createGalleryItemsMarkup } from './create-gallery-items';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.js-gallery');
const loadMoreBtn = document.querySelector('.js-load-more');
const observerGuard = document.querySelector(".js-guard");

let page = 1;
let pages = 1;
let previousSearchValue = '';

const intersectionObserverOptions = {
    root: null,
    rootMargin: '500px',
    threshold: 1.0,
};
const intersectionObserver = new IntersectionObserver(handleIntersection, intersectionObserverOptions);


searchForm.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', onLoad);


function onSubmit(evt) {
    evt.preventDefault();
    const currentSearchRequest = evt.target.elements.searchQuery.value.trim();
    const isPreviusValue = previousSearchValue !== '' && previousSearchValue !== currentSearchRequest;
    
    if (isPreviusValue) {
        resetGallery();
    };
    if (!currentSearchRequest) {
        return Notify.failure('Enter your request, please.');
    };
    previousSearchValue = currentSearchRequest;
    renderGalleryItems(currentSearchRequest, page);
    incrementPage();
};

function onLoad() { 
    loadMoreBtn.classList.replace('show', 'hide');
    renderGalleryItems(previousSearchValue, page);
    incrementPage();
};

function handleIntersection(entries, observer) {
     entries.forEach(entry => {
    if (entry.isIntersecting && previousSearchValue)  onLoad();
    if (pages < page) {
        observer.unobserve(observerGuard);
    }
  });
};

async function renderGalleryItems(searchRequest, searchPage) {
    try {
        const response = await getImages(searchRequest, searchPage);
        const arrayOfImages = response.data.hits;
        const foundImagesQty = response.data.totalHits;
        const totalFoundImages = response.data.total;
        pages = Math.round(totalFoundImages / foundImagesQty);

        createGalleryItemsMarkup(arrayOfImages, gallery);
        loadMoreBtn.classList.add('show');

        if (!totalFoundImages) {
            return Notify.info('Sorry, there are no images matching your search query. Please try again.');
        };
        if (arrayOfImages.length < 40) {
            loadMoreBtn.classList.remove('show');
            loadMoreBtn.classList.add('hide');
            Notify.failure("We're sorry, but you've reached the end of search results.");
        };
       
        if (page - 1 === 1) {
           Notify.success(`We found ${foundImagesQty} images.`);
        };
        console.log(arrayOfImages.length);
       
       
    } catch (error) {
        console.error(error.stack);  
    };
};

function incrementPage() {
    return page += 1;
};

function resetGallery() {
    page = 1;
    gallery.innerHTML = '';
    
    intersectionObserver.unobserve(observerGuard);
};

