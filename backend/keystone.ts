import 'dotenv/config';
import { config, createSchema } from '@keystone-next/keystone/schema';
import { createAuth } from '@keystone-next/auth';
import {
  withItemData,
  statelessSessions,
} from '@keystone-next/keystone/session';
import { User } from './schemas/User';
import { Product } from './schemas/Product';
import { ProductImage } from './schemas/ProductImage';
import { CartItem } from './schemas/CartItem';
import { insertSeedData } from './seed-data';
import { sendPasswordResetEmail } from './lib/mail';
import { extendGraphqlSchema } from './mutations';

const databaseURL =
  process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

const sessionConfig = {
  maxAge: 60 * 60 * 24 * 360, // How long they stay signed in?
  secret: process.env.COOKIE_SECRET,
};

const { withAuth } = createAuth({
  listKey: 'User',
  identityField: 'email',
  secretField: 'password',
  initFirstItem: {
    fields: ['name', 'email', 'password'],
    // TODO: Add in initial roles here
  },
  passwordResetLink: {
    async sendToken(args) {
      // sent the email
      await sendPasswordResetEmail(args.token, args.identity);
    },
  },
});

export default withAuth(
  config({
    // @ts-ignore
    server: {
      cors: {
        origin: [process.env.FRONTEND_URL],
        credentials: true,
      },
    },
    db: {
      adapter: 'mongoose',
      url: databaseURL,
      async onConnect(keystone) {
        console.log('Connected to the database');
        if (process.argv.includes('--seed-data')) {
          await insertSeedData(keystone);
        }
      },
      // TODO: Add data seeding here
    },
    lists: createSchema({
      // Schema items go in here
      User,
      Product,
      ProductImage,
      CartItem,
    }),
    extendGraphqlSchema,

    ui: {
      // Show the UI only for people who pass this test
      isAccessAllowed: ({ session }) => !!session?.data,
    },
    session: withItemData(statelessSessions(sessionConfig), {
      User: 'id',
    }),
  })
);

// import { config, createSchema } from '@keystone-next/keystone/schema';
// import 'dotenv/config';

// const databaseURL =
//   process.env.DATABASE_URL || 'mongodb://localhost/keystone-sick-fits-tutorial';

// const sessionConfig = {
//   maxAge: 60 * 60 * 24 * 360, // How long they stay signed in?
//   secret: process.env.COOKIE_SECRET,
// };

// export default config({
//   // @ts-ignore
//   server: {
//     cors: {
//       origin: [process.env.FRONTEND_URL],
//       credentials: true,
//     },
//   },
//   db: {
//     adapter: 'mongoose',
//     url: databaseURL,
//     // TODO: Add data seeding here
//   },
//   lists: createSchema({
//     // Schema items go in here
//   }),
//   ui: {
//     // TODO: change this for roles
//     isAccessAllowed: () => true,
//   },
//   // TODO: Add session values here
// });
