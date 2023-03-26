/* eslint-disable */
import { KeystoneContext } from '@keystone-next/types';
import { CartItem } from '../schemas/CartItem'
import { Session } from '../types';
import { CartItemCreateInput } from '../.keystone/schema-types';

export default async function addToCart(
  root: any,
  { productId }: { productId: string },
  context: KeystoneContext
): Promise<CartItemCreateInput> {
  console.log('Adding to Cart');
  // 1. Query the current user see if they are signed in
  const sesh = context.session as Session;
  if (!sesh.itemId) {
    throw new Error('You must be logged in to do this');
  }
  // 2. QUery the users cart
  const allCartItems = await context.lists.CartItem.findMany({
    where: { user: { id: sesh.itemId }, product: { id: productId } },
    resolveFields: 'id, quantity',
  });
  console.log(allCartItems)
  const [existingCartItem] = allCartItems;
  if (existingCartItem) {
    console.log(
      `There are already ${existingCartItem.quantity}, inrecement by 1! `
    );
    // 3. See if the current is in their cart
    // 4. if it is increment by 1
    return await context.lists.CartItem.updateOne({
      id: existingCartItem.id,
      data: { quantity: existingCartItem.quantity + 1 },
    });
  }
  // 4. if it isnt create a new cart item
  return await context.lists.CartItem.createOne({
    data: {
      product: { connect: { id: productId } },
      user: { connect: { id: sesh.itemId } },
    },
  });
}
