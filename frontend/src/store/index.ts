import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import storiesReducer from "../features/stories/storiesSlice";
import storyDetailReducer from "../features/storyDetail/storyDetailSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stories: storiesReducer,
    storyDetail: storyDetailReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;