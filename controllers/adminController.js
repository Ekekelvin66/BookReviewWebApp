import { db } from "../db.js";

// GET /admin
export const renderAdminDashboard = async (req, res) => {
  try {
    const [booksResult, usersResult, reviewsResult] = await Promise.all([
      db.query(`
        SELECT books.id, books.title, books.author, books.cover_url, books.created_at,
        COUNT(reviews.id) AS review_count,
        ROUND(AVG(reviews.rating), 1) AS avg_rating
        FROM books
        LEFT JOIN reviews ON reviews.book_id = books.id
        GROUP BY books.id
        ORDER BY books.created_at DESC
      `),
      db.query(`
        SELECT id, name, email, is_admin, created_at,
        (SELECT COUNT(*) FROM reviews WHERE reviews.user_id = users.id) AS review_count
        FROM users
        ORDER BY created_at DESC
      `),
      db.query(`SELECT COUNT(*) AS total FROM reviews`)
    ])

    res.render('admin/dashboard', {
      books: booksResult.rows,
      users: usersResult.rows,
      totalReviews: reviewsResult.rows[0].total,
      user: req.session.user
    })
  } catch (err) {
    res.status(500).render('error', { message: err.message })
  }
}

// POST /admin/books/:bookId/delete
export const adminDeleteBook = async (req, res) => {
  const { bookId } = req.params
  try {
    await db.query('DELETE FROM books WHERE id = $1', [bookId])
    res.redirect('/admin')
  } catch (err) {
    res.status(500).render('error', { message: err.message })
  }
}

// GET /admin/books/:bookId/edit
export const renderEditBook = async (req, res) => {
  const { bookId } = req.params
  try {
    const [bookResult, genresResult] = await Promise.all([
      db.query(`
        SELECT books.*, ARRAY_AGG(book_genres.genre_id) AS genre_ids
        FROM books
        LEFT JOIN book_genres ON books.id = book_genres.book_id
        WHERE books.id = $1
        GROUP BY books.id
      `, [bookId]),
      db.query('SELECT * FROM genres ORDER BY name')
    ])

    const book = bookResult.rows[0]
    if (!book) return res.redirect('/admin')

    res.render('admin/editBook', {
      book,
      genres: genresResult.rows,
      user: req.session.user,
      error: null
    })
  } catch (err) {
    res.status(500).render('error', { message: err.message })
  }
}

// POST /admin/books/:bookId/edit
export const adminEditBook = async (req, res) => {
  const { bookId } = req.params
  const { title, author, cover_url, genres } = req.body

  try {
    await db.query(
      'UPDATE books SET title = $1, author = $2, cover_url = $3 WHERE id = $4',
      [title.trim(), author.trim(), cover_url.trim(), bookId]
    )

    // Update genres
    await db.query('DELETE FROM book_genres WHERE book_id = $1', [bookId])

    if (genres) {
      const genreArray = Array.isArray(genres) ? genres : [genres]
      for (const genreId of genreArray) {
        await db.query(
          'INSERT INTO book_genres (book_id, genre_id) VALUES ($1, $2)',
          [bookId, genreId]
        )
      }
    }

    res.redirect('/admin')
  } catch (err) {
    res.status(500).render('error', { message: err.message })
  }
}

// POST /admin/users/:userId/delete
export const adminDeleteUser = async (req, res) => {
  const { userId } = req.params
  try {
    await db.query('DELETE FROM users WHERE id = $1', [userId])
    res.redirect('/admin')
  } catch (err) {
    res.status(500).render('error', { message: err.message })
  }
}

// POST /admin/users/:userId/ban
// export const adminBanUser = async (req, res) => {
//   const { userId } = req.params
//   try {
//     await db.query(
//       'UPDATE users SET is_banned = NOT is_banned WHERE id = $1',
//       [userId]
//     )
//     res.redirect('/admin')
//   } catch (err) {
//     res.status(500).render('error', { message: err.message })
//   }
// }
