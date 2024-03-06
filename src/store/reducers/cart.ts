import { getRecordKey, getRelatedVariant } from "@/common/util/helper";
import { createSlice, current } from "@reduxjs/toolkit";

// import { getCouponDiscount } from "~/utils/coupons";

interface CartState {
  data: Array<any>;
  coupon: any;
  ltoProducts: Array<any>;
  showCart: boolean;
}

// Define the initial state
const initialState: CartState = {
  data: [],
  coupon: null,
  ltoProducts: [],
  showCart: false,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const cart = current(state);
      const { payload: product } = action;

      if (!product) return cart;

      // const { id, price, listingPrice } = getRelatedVariant(_product) || {};

      // const product = {
      //   ..._product,
      //   price,
      //   listingPrice,
      //   variantId: id,
      // };

      let recordKey = getRecordKey(product);

      if (cart.data.some((item) => item.recordKey === recordKey)) {
        const data = cart.data.reduce((acc, cur) => {
          if (cur.recordKey === recordKey) {
            acc.push({
              ...cur,
              recordKey,
              quantity: parseInt(cur.quantity) + parseInt(product.quantity),
            });
          } else {
            acc.push({ ...cur });
          }

          return acc;
        }, []);

        state.data = data;
      } else {
        state.data = [
          ...cart.data,
          { ...product, recordKey: getRecordKey(product) },
        ];
      }
    },
    removeFromCart: (state, action) => {
      const cart = current(state);
      const { payload: product } = action;

      if (!product) return cart;

      const recordKey = getRecordKey(product);
      const existing = cart.data.find((b) => b.recordKey === recordKey);

      if (existing) {
        if (
          !product.quantity ||
          parseInt(existing.quantity) - parseInt(product.quantity) < 1
        ) {
          state.data = cart.data.filter((b) => b.recordKey !== recordKey);
        } else {
          state.data = cart.data.map((p) => {
            if (p.recordKey === recordKey) {
              return {
                ...p,
                quantity:
                  parseInt(existing.quantity) - parseInt(product.quantity),
              };
            }
            return p;
          });
        }
      }
      return state;
    },

    deleteItem: (state, action) => {
      const box = current(state);
      const { payload: product } = action;

      if (!product) return box;

      const recordKey = getRecordKey(product);

      state.data = box.data.filter((b) => b.recordKey !== recordKey);

      return state;
    },

    applyCoupons: (state, action) => {
      state.coupon = action.payload.coupon;
    },
    removeCoupon: (state) => {
      state.coupon = null;
    },
    emptyCart: (state) => {
      state.data = [];
      state.coupon = null;
    },
    validateCart: (state, action) => {
      const { payload } = action;
      state.data = state.data.map((item) => {
        if (typeof payload[item.recordKey] === "number") {
          return {
            ...item,
            price: payload[item.recordKey],
          };
        }
        return item;
      });
    },
    initializeLTO: (state, action) => {
      state.ltoProducts = action.payload.ltoProducts;
    },

    toggleCart: (state) => {
      state.showCart = !state.showCart;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  // updateCart,
  deleteItem,
  applyCoupons,
  removeCoupon,
  emptyCart,
  toggleCart,
  validateCart,
  initializeLTO,
} = cartSlice.actions;

export default cartSlice.reducer;
