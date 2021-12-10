const cafeList = document.querySelector('#cafe-list');
const form = document.querySelector('#add-cafe-form');

// create element and render cafe
function renderCafe(doc) {
    let li = document.createElement('li');
    let name = document.createElement('span');
    let city = document.createElement('span');
    let delBtn = document.createElement('div');
    let editBtn = document.createElement('div');
    let editForm = document.createElement('form');

    li.setAttribute('data-id', doc.id);
    name.classList.add('name');
    name.textContent = doc.data().name;
    city.classList.add('city');
    city.textContent = doc.data().city;

    // Delete button
    delBtn.classList.add('delete-btn', 'fas', 'fa-trash');

    // Edit button
    editBtn.classList.add('edit-btn', 'fas', 'fa-edit');

    // Edit form
    editForm.setAttribute('id', 'edit-form');
    editForm.innerHTML = `<input type="text" name="name" placeholder="Name">
                            <input type="text" name="city" placeholder="City">
                            <button type="submit">Save</button>
                            <button type="button" name="cancel" class="cancel">Cancel</button>`;
    editForm.style.display = 'none';

    li.appendChild(name);
    li.appendChild(city);
    li.appendChild(editForm);
    li.appendChild(delBtn);
    li.appendChild(editBtn);

    cafeList.appendChild(li);

    // Deleting data
    delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        db.collection('cafes').doc(id).delete();
    });

    // Editing data
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let name = e.target.parentElement.querySelector('.name');
        let city = e.target.parentElement.querySelector('.city');
        let editForm = e.target.parentElement.querySelector('#edit-form');

        editForm.name.value = name.textContent;
        editForm.city.value = city.textContent;

        name.style.display = 'none';
        city.style.display = 'none';
        editForm.style.display = 'block';
    });

    editForm.cancel.addEventListener('click', (e) => {
        e.target.parentElement.style.display = 'none';
        name.style.display = 'block';
        city.style.display = 'block';

        console.log(e.target.parentElement.parentElement, name);
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let id = e.target.parentElement.getAttribute('data-id');

        db.collection('cafes').doc(id).update({
            name: editForm.name.value,
            city: editForm.city.value
        }).then(() => {
            editForm.style.display = 'none';
            name.style.display = 'block';
            city.style.display = 'block';
        });
    });
    
}

// Getting data
/* db.collection('cafes').where('city', '==', 'Brazil').orderBy('name').get().then((snapshot) => {
    snapshot.docs.forEach(doc => {
        renderCafe(doc);
    });
}); */

// Saving data
form.addEventListener('submit', (e) => {
    e.preventDefault();

    if( form.name.value !== '' && form.city.value !== '' ) {
        db.collection('cafes').add({
            name: form.name.value,
            city: form.city.value
        });
        
        form.name.value = '';
        form.city.value = '';
    }

});

// Real-time listener
db.collection('cafes').orderBy('city').onSnapshot( snapshot => {
    let changes = snapshot.docChanges();

    changes.forEach( change => {

        if( change.type == 'added' ) {
            renderCafe(change.doc);
        } else if( change.type == 'removed' ) {
            let li = cafeList.querySelector('[data-id=' + change.doc.id + ']');
            cafeList.removeChild(li);
        } else if( change.type == 'modified' ) {
            let li = cafeList.querySelector('[data-id=' + change.doc.id + ']');
            let name = li.querySelector('.name');
            let city = li.querySelector('.city');

            name.textContent = change.doc.data().name;
            city.textContent = change.doc.data().city;
        }

    });
});