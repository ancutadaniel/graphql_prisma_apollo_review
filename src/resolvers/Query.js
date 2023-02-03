import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const Query = {
  user: (parent, args, ctx, info) => {
    return prisma.user.findUnique({
      where: {
        id: args.id,
      },
      include: {
        books: true,
        reviews: true,
      },
    });
  },
  book: (parent, args, ctx, info) => {
    return prisma.book.findUnique({
      where: {
        id: args.id,
      },
    });
  },
  allUsers: () =>
    prisma.user.findMany({
      orderBy: {
        name: 'asc',
      },
      include: {
        books: true,
        reviews: true,
      },
    }),
  allBooks: () =>
    prisma.book.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: true,
        reviews: true,
      },
    }),
  allReviews: () =>
    prisma.review.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        book: true,
        author: true,
      },
    }),
};

export default Query;
