const BookService = require('../../../lib/services/BookService');

describe('Book Service', () => {
  let bookService = null;
  beforeEach(() => {
    bookService = new BookService();
  });

  describe('Get Books', () => {
    it('return all books', () => {
      expect(bookService.getBooks()).toEqual(bookService.books);
    });
  });

  describe('Get Book', () => {
    it('return all books', () => {
      expect(bookService.getBook(2)).toEqual(bookService.books[1]);
    });
  });

  describe('Add book', () => {
    it('Adds the book if ok', () => {
      const book = {
        id: 5,
        name: 'Dor Shay The KING!',
      };

      bookService.addBook(book);
      expect(bookService.books[bookService.books.length - 1]).toEqual(book);
    });

    it('throws error if missing id', () => {
      const book = {
        name: 'Dor Shay The KING!',
      };

      expect(() => bookService.addBook(book)).toThrow();
    });
  });

  describe('Delete Book', () => {
    it('removes the book', () => {
      const deletedBook = bookService.getBook(2);
      bookService.deleteBook(2);
      expect(bookService.getBooks()).not.toContain(deletedBook);
    });


    it('dont removes other books', () => {
      const notDeletedBook = bookService.getBook(1);
      bookService.deleteBook(2);
      expect(bookService.getBooks()).toContain(notDeletedBook);
    });
  });
});
