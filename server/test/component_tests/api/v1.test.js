const request = require('supertest');

const app = require('../../../app');
const BookService = require('../../../lib/services/BookService');

describe('api v1', () => {
  const baseUrl = '/api/v1';
  const bookService = new BookService();

  describe('book resource', () => {
    it('get all books', async () => {
      const res = await request(app).get(`${baseUrl}/book`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(bookService.getBooks());
    });

    it('get specific book', async () => {
      const res = await request(app).get(`${baseUrl}/book/1`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(bookService.getBook(1));
    });


    it('add a book', async () => {
      const newBook = {
        id: 5,
        name: 'Lion King',
      };

      const res = await request(app).post(`${baseUrl}/book`).send(newBook);
      expect(res.statusCode).toBe(200);

      const getRes = await request(app).get(`${baseUrl}/book/${newBook.id}`);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body).toEqual(newBook);
    });

    it('delete a book', async () => {
      const res = await request(app).delete(`${baseUrl}/book/1`);
      expect(res.statusCode).toBe(200);

      const getRes = await request(app).get(`${baseUrl}/book/1`);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body).toEqual('');
    });

    it('edit a book', async () => {
      const newBook = {
        name: 'Lion King',
      };

      const res = await request(app).put(`${baseUrl}/book/2`).send(newBook);
      expect(res.statusCode).toBe(200);

      const getRes = await request(app).get(`${baseUrl}/book/2`);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body).toEqual({
        id: 2,
        name: newBook.name,
      });
    });
  });
});
