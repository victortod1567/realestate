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
        let objectStore = db.createObjectStore('listings', { keyPath: 'id', autoIncrement:true });
        
        console.log("Хранилище за обявите е създадено.");
    };

    // Функция за съхранение на обяви
    function saveListing(listing) {
        let transaction = db.transaction(['listings'], 'readwrite');
        let objectStore = transaction.objectStore('listings');
        let request = objectStore.add(listing);

        request.onsuccess = function(event) {
            console.log('Обявата е запазена успешно в базата данни.');
        };

        request.onerror = function(event) {
            console.log('Грешка при запазване на обявата в базата данни.');
        };
    }

    // Функция за извличане на обяви
    function retrieveListings() {
        let transaction = db.transaction(['listings'], 'readonly');
        let objectStore = transaction.objectStore('listings');
        let request = objectStore.getAll();

        request.onsuccess = function(event) {
            let listings = request.result;

            // Тук можеш да направиш нещо с обявите, като ги покажеш на страницата
            console.log('Извлечени обяви:', listings);
        };

        request.onerror = function(event) {
            console.log('Грешка при извличане на обявите от базата данни.');
        };
    }


    // Прочитане на снимките и запазване на обявата
    document.getElementById('create-listing-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const title = document.getElementById('title').value;
        const propertyType = document.querySelector('input[name="property-type"]:checked').value;
        const price = document.getElementById('price').value;
        const area = document.getElementById('area').value;
        const city = document.getElementById('city').value;
        const description = document.getElementById('description').value;
        const contact = document.getElementById('contact').value;
        const images = document.getElementById('images').files;

        if (title && propertyType && price && area && city && description && contact && images.length > 0) {
            const imagesData = [];
            const reader = new FileReader();

            reader.onload = function(event) {
                imagesData.push(event.target.result);

                if (imagesData.length === images.length) {
                    const newListing = {
                        title: title,
                        propertyType: propertyType,
                        price: price,
                        area: area,
                        city: city,
                        description: description,
                        contact: contact,
                        images: imagesData
                    };

                    saveListing(newListing);

                    alert('Обявата е качена успешно!');
                    document.getElementById('create-listing-form').reset();
                    retrieveListings();
                } else {
                    reader.readAsDataURL(images[imagesData.length]);
                }
            };

            reader.readAsDataURL(images[0]);
        } else {
            alert('Моля, попълнете всички полета и изберете поне една снимка.');
        }
    });
});
