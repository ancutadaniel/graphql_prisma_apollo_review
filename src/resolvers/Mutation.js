import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Mutation = {
  createUser: (parent, args, ctx, info) => {
    const { data } = args;
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
      },
    });
  },
  updateUser: (parent, args, ctx, info) => {
    const { id, data } = args;
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
      },
    });
  },
  deleteUser: async (parent, args, ctx, info) => {
    const { id } = args;
    // Delete reviews
    const reviews = await prisma.review.findMany({
      where: {
        authorId: id,
      },
    });
    const reviewIds = reviews.map((review) => review.id);
    await prisma.review.deleteMany({
      where: {
        id: {
          in: reviewIds,
        },
      },
    });

    // Delete the user
    return prisma.user.delete({
      where: {
        id,
      },
    });
  },
  createBook: (parent, args, ctx, info) => {
    const { data } = args;
    return prisma.book.create({
      data: {
        title: data.title,
        publisher: data.publisher,
        isbn: data.isbn,
        author: {
          connect: {
            id: data.authorId,
          },
        },
      },
      include: {
        author: true,
      },
    });
  },

  deleteBook: async (parent, args, ctx, info) => {
    const { id } = args;

    // Delete reviews
    const reviews = await prisma.review.findMany({
      where: {
        bookId: id,
      },
    });
    const reviewIds = reviews.map((review) => review.id);
    await prisma.review.deleteMany({
      where: {
        id: {
          in: reviewIds,
        },
      },
    });

    // Delete the book
    return prisma.book.delete({
      where: {
        id,
      },
    });
  },

  createReview: (parent, args, ctx, info) => {
    const { data } = args;
    return prisma.review.create({
      data: {
        rating: data.rating,
        text: data.text,
        book: {
          connect: {
            id: data.bookId,
          },
        },
        author: {
          connect: {
            id: data.authorId,
          },
        },
      },
      include: {
        book: true,
        author: true,
      },
    });
  },
};

export default Mutation;
