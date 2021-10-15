'use strict'

import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

const qs = (selector) => document.querySelector(selector);

const searchingBox = qs('.searching-box');
const searchQuery = qs('input[name="searchQuery"]');
const searchForm = qs('#search-form');
const gallery = qs('.gallery');
const loadButtom = qs('.load-more');

const clear = elements => { [...elements.children].forEach(el => el.remove()) };
const lightbox = () => new SimpleLightbox('.gallery a', {});

let perPage = 40;
let page = 0;
let name = searchQuery.value;

loadButtom.style.display = 'none';

async function fetchImage(name, page) {
    try {
        const response = await axios.get(
            `https://pixabay.com/api/?key=23873456-b78ceb804e9b51f35f4c6e0e8&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
        );
        console.log(response);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

async function eventHandler(event) {
    event.preventDefault();
    clear(gallery);
    loadButtom.style.display = 'none';
    page = 1;
    name = searchQuery.value;
    console.log(name);
    fetchImage(name, page)
        .then(name => {
            console.log(`Number of arrays: ${name.hits.length}`);
            console.log(`Total hits: ${name.totalHits}`);
            let totalPages = Math.ceil(name.totalHits / perPage);
            console.log(`Total pages: ${totalPages}`);
            if (name.hits.length > 0) {
                Notiflix.Notify.success(`Hooray! We found ${name.totalHits} images.`);
                renderGallery(name);
                console.log(`Current page: ${page}`);
                lightbox();
                
                if (page < totalPages) {
                    loadButtom.style.display = 'block';
                } else {
                    loadButtom.style.display = 'none';
                    console.log('There are no more images');
                    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
                }
            } else {
                Notiflix.Notify.failure(
                    'Sorry, there are no images matching your search query. Please try again.',
                );
                clear(gallery);
            }
        })
        .catch(error => console.log(error));
}

searchForm.addEventListener('submit', eventHandler);

function renderGallery(name) {
    const markup = name.hits
        .map(hit => {
            return `<div class="photo-card">
            <a class="gallery__item" href="${hit.largeImageURL}"> <img class="gallery__image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" /></a>
            <div class="info">
                <p class="info-item">
                <p><b>Likes</b> <br>${hit.likes}</br></p>
                </p>
                <p class="info-item">
                <p><b>Views</b> <br>${hit.views}</br></p>
                </p>
                <p class="info-item">
                <p><b>Comments</b> <br>${hit.comments}</br></p>
                </p>
                <p class="info-item">
                <p><b>Downloads</b> <br>${hit.downloads}</br></p>
                </p>
            </div>
            </div>`;
        })
        .join('');
    gallery.insertAdjacentHTML('beforeend', markup);
}

loadButtom.addEventListener('click', () => {
    name = searchQuery.value;
    console.log('load more images');
    page += 1;
    fetchImage(name, page)
        .then(name => {
            let totalPages = Math.ceil(name.totalHits / perPage);
            renderGallery(name);
            //smooth scroll
            const { height: cardHeight } = document
                .querySelector('.gallery')
                .firstElementChild.getBoundingClientRect();

            window.scrollBy({
            top: cardHeight * 2,
            behavior: 'smooth',
            });
            //===
            lightbox().refresh();
            console.log(`Current page: ${page}`);

            if (page >= totalPages) {
                loadButtom.style.display = 'none';
                console.log('There are no more images');
                Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
            }
        });
    //console.log("Load more button clicked");
    },
    true,
);