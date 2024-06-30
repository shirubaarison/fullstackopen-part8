const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
    Query: {
      authorCount: async () => Author.countDocuments(),
      bookCount: async () => Book.countDocuments(),
      allBooks: async (root, args) => {
        let filter = {}
        if (args.author) {
          const author = await Author.findOne({ name: args.author });
          if (author) {
            filter.author = author._id
          } else {
            return []
          }
        }
        if (args.genre) {
          filter.genres = args.genre
        }
        return Book.find(filter).populate('author')
      },
      allAuthors: async () => Author.find({}),
      me:  (root, args, context) => {
        return context.currentUser
      }
    },
    Author: {
      bookCount: async (author) => {
          return Book.countDocuments({ author: author._id })
      },
    },
    Mutation: {
      addBook: async (root, args, context) => {      
        const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: "BAD_USER_INPUT"
            }
          })
        }
        
        
        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = new Author({
            name: args.author,
          })
          try {
            await author.save()
          } catch (error) {
            throw new GraphQLError('Saving author failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.author,
                error
              }
            })
          }
        }
  
        const book = new Book({
          title: args.title,
          published: args.published,
          author: author._id,
          genres: args.genres
         })
  
        try {
          await book.save()
        } catch (error) {
          throw new GraphQLError('Saving book failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
              error
            }
          })
        }

        pubsub.publish('BOOK_ADDED', { bookAdded: book })

        return book.populate('author')
      },
      editAuthor: async (root, args, context) => {
        const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: "BAD_USER_INPUT"
            }
          })
        }
        
        const author = await Author.findOne({ name: args.name })
        if (!author)
          return null
  
        author.born = args.setBornTo
        try {
          return author.save()
        } catch (error) {
          throw new GraphQLError('Editing author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
              error
            }
          })      
        }
      },
      createUser: async (root, args) => {
        const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
        try {
          return user.save()
        } catch (error) {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        }
      },
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
  
        if (!user || args.password !== 'secret') {
          throw new GraphQLError('wrong credentials', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          })
        }
  
        const userForToken = {
          username: user.username,
          id: user._id,
        }
  
        return { value: jwt.sign(userForToken, process.env.SECRET) }
      }
    },
    Subscription: {
      bookAdded: {
        subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
        resolve: async (payload) => {
          const populatedBook = await Book.findById(payload.bookAdded._id).populate('author');
          return populatedBook;
        },
      },
    }
  }

module.exports = resolvers