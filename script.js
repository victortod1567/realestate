document.addEventListener('DOMContentLoaded', function() {
    // Отваряне на базата данни
    let request = indexedDB.open('listingsDB', 1);
    let db;

    request.onerror = function(event) {
        console.log("Грешка при отваряне на базата данни.");
    };

    request.onsuccess = function(event) {
        db = request.result;
        console.log("Базата данни е отворена успешно.");


        // Извличане на обявите при зареждане на страницата
        retrieveListings();
        

    };

    request.onupgradeneeded = function(event) {
        db = event.target.result;

        // Създаване на хранилище за обявите
        let objectStore = db.createObjectStore('listings', { keyPath: 'id', autoIncrement: true });
        console.log("Хранилище за обявите е създадено.");
    };

    // Функция за извличане на обяви
    function retrieveListings() {
        let transaction = db.transaction(['listings'], 'readonly');
        let objectStore = transaction.objectStore('listings');
        let request = objectStore.getAll();

        request.onsuccess = function(event) {
            let listings = request.result;

            // Показване на обявите на страницата
            displayLatestListings(listings);
        };

        request.onerror = function(event) {
            console.log('Грешка при извличане на обявите от базата данни.');
        };
    }

    // Функция за създаване на HTML елемент за обява
    function createListingElement(listing) {
        const listingElement = document.createElement('div');
        listingElement.classList.add('card', 'mb-3');

        const imageElement = document.createElement('img');
        imageElement.src = listing.images[0];
        imageElement.alt = listing.title;
        imageElement.classList.add('card-img-top');
        listingElement.appendChild(imageElement);

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const titleElement = document.createElement('h5');
        titleElement.classList.add('card-title');
        titleElement.textContent = listing.title;
        cardBody.appendChild(titleElement);

        const priceElement = document.createElement('p');
        priceElement.classList.add('card-text');
        priceElement.textContent = `Цена: ${listing.price} лв.`;
        cardBody.appendChild(priceElement);

        const areaElement = document.createElement('p');
        areaElement.classList.add('card-text');
        areaElement.textContent = `Площ: ${listing.area} кв.м.`;
        cardBody.appendChild(areaElement);

        const cityElement = document.createElement('p');
        cityElement.classList.add('card-text');
        cityElement.textContent = `Град: ${listing.city}`;
        cardBody.appendChild(cityElement);

        const detailsButton = document.createElement('a');
        detailsButton.href = `details.html?id=${listing.id}`;
        detailsButton.classList.add('btn', 'btn-primary');
        detailsButton.textContent = 'Виж повече';
        cardBody.appendChild(detailsButton);

        listingElement.appendChild(cardBody);
        return listingElement;
    }

    // Функция за показване на последните обяви
    function displayLatestListings() {
        let transaction = db.transaction(['listings'], 'readonly');
        let objectStore = transaction.objectStore('listings');
        let request = objectStore.getAll();

        request.onsuccess = function(event) {
            let listings = request.result;

            // Сортирай обявите по дата на създаване (или друг критерий)
            listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // Изведи само първите пет обяви
            const latestListings = listings.slice(0, 5);

            // Извеждане на обявите на страницата
            const listingsContainer = document.getElementById('listings');
            listingsContainer.innerHTML = ''; // Изчистване на съдържанието преди добавяне на новите обяви

            latestListings.forEach(listing => {
                const listingElement = createListingElement(listing);
                listingsContainer.appendChild(listingElement);
            });
        };

        request.onerror = function(event) {
            console.log('Грешка при извличане на обявите от базата данни.');
        };
    }

    // Обработка на формата за търсене
    document.getElementById('search-form').addEventListener('submit', function(event) {
        event.preventDefault();

        let city = document.getElementById('city').value;
        let priceFrom = document.getElementById('price-from').value;
        let priceTo = document.getElementById('price-to').value;
        let areaFrom = document.getElementById('area-from').value;
        let areaTo = document.getElementById('area-to').value;

        let propertyTypes = [];
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(function(checkbox) {
            propertyTypes.push(checkbox.value);
        });

        searchListings(city, priceFrom, priceTo, areaFrom, areaTo, propertyTypes);
    });

    function searchListings(city, priceFrom, priceTo, areaFrom, areaTo, propertyTypes) {
    let transaction = db.transaction(['listings'], 'readonly');
    let objectStore = transaction.objectStore('listings');
    let request = objectStore.getAll();

    request.onsuccess = function(event) {
        let listings = request.result;

        // Филтриране на обявите спрямо подадените критерии
        let results = listings.filter(function(listing) {
            // Преобразуване на текстовите стойности за цена и квадратура в числа
            let price = parseInt(listing.price);
            let area = parseInt(listing.area);

            // Проверка на критериите за търсене
            let cityMatch = !city || listing.city === city;
            let priceMatch = (!priceFrom || price >= parseInt(priceFrom)) &&
                             (!priceTo || price <= parseInt(priceTo));
            let areaMatch = (!areaFrom || area >= parseInt(areaFrom)) &&
                            (!areaTo || area <= parseInt(areaTo));
            let typeMatch = propertyTypes.length === 0 || propertyTypes.includes(listing.propertyType);

            // Връщане на резултатите, които отговарят на всички критерии
            return cityMatch && priceMatch && areaMatch && typeMatch;
        });

        displayResults(results);
    };

    request.onerror = function(event) {
        console.log('Грешка при извличане на обявите от базата данни.');
    };
}




    function displayResults(results) {
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';

        results.forEach(function(listing) {
            const listingElement = createListingElement(listing);
            resultsContainer.appendChild(listingElement);
        });

        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>Няма намерени обяви по зададените критерии.</p>';
        }
    }


    function dropTable() {
    const objectStore = db.transaction('listings', "readwrite").objectStore('listings');
    const objectStoreRequest = objectStore.clear();

    objectStoreRequest.onsuccess = function(event) {
        console.log('Erase of database completed.');
    };
}
});
