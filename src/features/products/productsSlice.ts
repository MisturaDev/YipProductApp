import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MAX_PRODUCTS } from "../../constants/limits";
import type { RootState } from "../../app/store";
import type {
  AppConfig,
  Product,
  ProductInput,
  ProductUpdateInput,
} from "../../types/product";
import {
  createProduct,
  getProductsByOwner,
  deleteProduct,
  updateProduct,
} from "../../services/productService";

type UploadPayload = {
  data: ProductInput;
  config: AppConfig;
};

type FetchPayload = {
  config: AppConfig;
};

type UpdatePayload = {
  data: ProductUpdateInput;
  config: AppConfig;
};

type DeletePayload = {
  id: string;
  config: AppConfig;
};

type UpdatedProduct = {
  id: string;
  changes: Partial<Product>;
};

type ProductsState = {
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ProductsState = {
  items: [],
  status: "idle",
  error: null,
};

export const uploadProduct = createAsyncThunk<
  Product,
  UploadPayload,
  { state: RootState; rejectValue: string }
>("products/uploadProduct", async ({ data, config }, thunkApi) => {
  const state = thunkApi.getState();
  const user = state.auth.user;
  if (!user) {
    return thunkApi.rejectWithValue("You must be logged in to upload.");
  }

  const count = state.products.items.length;
  if (count >= MAX_PRODUCTS) {
    return thunkApi.rejectWithValue(
      `Upload limit reached. You can only upload ${MAX_PRODUCTS} products.`
    );
  }

  try {
    return await createProduct(data, config, {
      uid: user.uid,
      email: user.email,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Product upload failed.";
    return thunkApi.rejectWithValue(message);
  }
});

export const fetchUserProducts = createAsyncThunk<
  Product[],
  FetchPayload,
  { state: RootState; rejectValue: string }
>("products/fetchUserProducts", async ({ config }, thunkApi) => {
  const user = thunkApi.getState().auth.user;
  if (!user) {
    return thunkApi.rejectWithValue("You must be logged in to fetch products.");
  }

  try {
    return await getProductsByOwner(user.uid, config);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not fetch products.";
    return thunkApi.rejectWithValue(message);
  }
});

export const editProduct = createAsyncThunk<
  UpdatedProduct,
  UpdatePayload,
  { state: RootState; rejectValue: string }
>("products/editProduct", async ({ data, config }, thunkApi) => {
  const state = thunkApi.getState();
  const user = state.auth.user;
  if (!user) {
    return thunkApi.rejectWithValue("You must be logged in to edit.");
  }

  const existing = state.products.items.find((item) => item.id === data.id);
  if (!existing) {
    return thunkApi.rejectWithValue("Product not found.");
  }
  if (existing.ownerId !== user.uid) {
    return thunkApi.rejectWithValue("You can only edit your own product.");
  }

  try {
    const updated = await updateProduct(data, config);
    return {
      id: data.id,
      changes: {
        name: updated.name,
        description: updated.description,
        price: updated.price,
        ...(updated.imageUrl ? { imageUrl: updated.imageUrl } : {}),
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Product update failed.";
    return thunkApi.rejectWithValue(message);
  }
});

export const removeProduct = createAsyncThunk<
  string,
  DeletePayload,
  { state: RootState; rejectValue: string }
>("products/removeProduct", async ({ id, config }, thunkApi) => {
  const state = thunkApi.getState();
  const user = state.auth.user;
  if (!user) {
    return thunkApi.rejectWithValue("You must be logged in to delete.");
  }

  const existing = state.products.items.find((item) => item.id === id);
  if (!existing) {
    return thunkApi.rejectWithValue("Product not found.");
  }
  if (existing.ownerId !== user.uid) {
    return thunkApi.rejectWithValue("You can only delete your own product.");
  }

  try {
    await deleteProduct(id, config);
    return id;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Product delete failed.";
    return thunkApi.rejectWithValue(message);
  }
});

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductsError: (state) => {
      state.error = null;
    },
    clearProducts: (state) => {
      state.items = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchUserProducts.fulfilled,
        (state, action: PayloadAction<Product[]>) => {
          state.status = "succeeded";
          state.items = action.payload;
        }
      )
      .addCase(fetchUserProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Could not fetch products.";
      })
      .addCase(uploadProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(uploadProduct.fulfilled, (state, action: PayloadAction<Product>) => {
        state.status = "succeeded";
        state.items.unshift(action.payload);
      })
      .addCase(uploadProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Product upload failed.";
      })
      .addCase(editProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        editProduct.fulfilled,
        (state, action: PayloadAction<UpdatedProduct>) => {
          state.status = "succeeded";
          const index = state.items.findIndex((item) => item.id === action.payload.id);
          if (index >= 0) {
            state.items[index] = {
              ...state.items[index],
              ...action.payload.changes,
            };
          }
        }
      )
      .addCase(editProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Product update failed.";
      })
      .addCase(removeProduct.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(removeProduct.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = "succeeded";
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Product delete failed.";
      });
  },
});

export const { clearProductsError, clearProducts } = productsSlice.actions;

export const selectProducts = (state: RootState) => state.products.items;
export const selectProductsCount = (state: RootState) => state.products.items.length;
export const selectProductsStatus = (state: RootState) => state.products.status;
export const selectProductsError = (state: RootState) => state.products.error;
export const selectUploadLimitReached = (state: RootState) =>
  state.products.items.length >= MAX_PRODUCTS;
export const selectProductById = (id: string) => (state: RootState) =>
  state.products.items.find((item) => item.id === id);

export default productsSlice.reducer;
