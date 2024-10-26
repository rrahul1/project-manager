import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "./slices/ProjectSlice";
import projectCountReducer from "./slices/ProjectCountSlice";

export const store = configureStore({
   reducer: {
      project: projectReducer,
      projectCount: projectCountReducer,
   },
});
