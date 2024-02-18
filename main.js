/**
{
  id: string | number,
  title: string,
  author: string,
  year: number,
  isComplete: boolean,
}
 */
const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_APPS';

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  }
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}


/**
 * Fungsi ini digunakan untuk memeriksa apakah localStorage didukung oleh browser atau tidak
 *
 * @returns boolean
 */
function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

/**
 * Fungsi ini digunakan untuk menyimpan data ke localStorage
 * berdasarkan KEY yang sudah ditetapkan sebelumnya.
 */
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

/**
 * Fungsi ini digunakan untuk memuat data dari localStorage
 * Dan memasukkan data hasil parsing ke variabel {@see books}
 */
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}


function makeBook(bookObject) {
  const {id, title, author, year, isComplete} = bookObject;

  const textTitle = document.createElement('h3');
  textTitle.innerText = title;

  const textAuthor = document.createElement('p')
  textAuthor.innerText = `Penulis: ${author}`

  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${year}`;

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('action');

  const trashButton = document.createElement('button');
  trashButton.classList.add('trash-button');
  trashButton.innerText = 'Delete';  
  trashButton.addEventListener('click', function () {
    removeBookFromCompleted(id);
  });

  const textBooksWrapper = document.createElement('div');
  textBooksWrapper.classList.add('inner');
  textBooksWrapper.append(textTitle, textAuthor, textYear, buttonContainer);  

  const container = document.createElement('div');
  container.classList.add('item', 'shadow')
  container.append(textBooksWrapper);
  container.setAttribute('id', `book-${id}`);

  if (isComplete) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.innerText = 'Not Complete'
    undoButton.addEventListener('click', function () {
      undoBookFromCompleted(id);
    });

    buttonContainer.append(trashButton, undoButton);
  } else {

    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.innerText = 'Complete'
    checkButton.addEventListener('click', function () {
      addBookToCompleted(id);
    });

    buttonContainer.append(trashButton, checkButton);
  }

  return container;
}

function addBook() {
  const titleBook = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = parseInt(document.getElementById('inputBookYear').value);
  const isCompleted = document.getElementById('inputBookIsComplete').checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, titleBook, author, year, isCompleted);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBookFromCompleted(bookId /* HTMLELement */) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookId /* HTMLELement */) {

  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener('DOMContentLoaded', function () {

  const submitForm /* HTMLFormElement */ = document.getElementById('inputBook');

  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log('Data berhasil di simpan.');
});

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBOOKList = document.getElementById('incompleteBookshelfList');
  const listCompleted = document.getElementById('completeBookshelfList');

  // clearing list item
  uncompletedBOOKList.innerHTML = '';
  listCompleted.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      listCompleted.append(bookElement);
    } else {
      uncompletedBOOKList.append(bookElement);
    }
  }
})
