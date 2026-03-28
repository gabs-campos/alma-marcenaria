"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";

export type CartItem = {
  productId: number;
  name: string;
  priceCents: number;
  imageUrl?: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  shippingCents: number | null;
  cep: string;
};

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "quantity">; quantity?: number }
  | { type: "REMOVE"; productId: number }
  | { type: "SET_QTY"; productId: number; quantity: number }
  | { type: "CLEAR" }
  | { type: "SET_CEP"; cep: string }
  | { type: "SET_SHIPPING"; shippingCents: number | null };

function clampQty(qty: number) {
  if (!Number.isFinite(qty)) return 1;
  return Math.min(99, Math.max(1, Math.round(qty)));
}

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const quantity = clampQty(action.quantity ?? 1);
      const existing = state.items.find(
        (i) => i.productId === action.item.productId,
      );
      if (!existing) {
        return {
          ...state,
          items: [...state.items, { ...action.item, quantity }],
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.item.productId
            ? { ...i, quantity: clampQty(i.quantity + quantity) }
            : i,
        ),
      };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.productId),
      };
    case "SET_QTY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: clampQty(action.quantity) }
            : i,
        ),
      };
    case "CLEAR":
      return { items: [], shippingCents: null, cep: "" };
    case "SET_CEP":
      return { ...state, cep: action.cep };
    case "SET_SHIPPING":
      return { ...state, shippingCents: action.shippingCents };
    default:
      return state;
  }
}

const CartContext = createContext<{
  items: CartItem[];
  cep: string;
  shippingCents: number | null;
  itemsCount: number;
  subtotalCents: number;
  totalCents: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
  setCep: (cep: string) => void;
  setShipping: (shippingCents: number | null) => void;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    shippingCents: null,
    cep: "",
  });

  const subtotalCents = useMemo(
    () =>
      state.items.reduce((acc, i) => acc + i.priceCents * i.quantity, 0),
    [state.items],
  );

  const itemsCount = useMemo(
    () => state.items.reduce((acc, i) => acc + i.quantity, 0),
    [state.items],
  );

  const totalCents = useMemo(
    () => subtotalCents + (state.shippingCents ?? 0),
    [subtotalCents, state.shippingCents],
  );

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity?: number) =>
      dispatch({ type: "ADD", item, quantity }),
    [],
  );
  const removeItem = useCallback(
    (productId: number) => dispatch({ type: "REMOVE", productId }),
    [],
  );
  const setQuantity = useCallback(
    (productId: number, quantity: number) =>
      dispatch({ type: "SET_QTY", productId, quantity }),
    [],
  );
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const setCep = useCallback((cep: string) => dispatch({ type: "SET_CEP", cep }), []);
  const setShipping = useCallback(
    (shippingCents: number | null) =>
      dispatch({ type: "SET_SHIPPING", shippingCents }),
    [],
  );

  const value = useMemo(
    () => ({
      items: state.items,
      cep: state.cep,
      shippingCents: state.shippingCents,
      itemsCount,
      subtotalCents,
      totalCents,
      addItem,
      removeItem,
      setQuantity,
      clear,
      setCep,
      setShipping,
    }),
    [
      itemsCount,
      subtotalCents,
      totalCents,
      addItem,
      clear,
      removeItem,
      setCep,
      setQuantity,
      setShipping,
      state.cep,
      state.items,
      state.shippingCents,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

