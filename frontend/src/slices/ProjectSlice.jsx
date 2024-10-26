import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
   projects: [],
   status: "idle",
   error: null,
};

// Fetch projects with a filter and include the authorization token
export const fetchProjects = createAsyncThunk(
   "project/fetchProjects",
   async ({ filter, token }) => {
      const response = await axios.get(
         `http://localhost:5000/api/project/get-projects/${filter}`,
         {
            headers: {
               Authorization: `Bearer ${token}`,
            },
         }
      );
      return response.data;
   }
);

const projectSlice = createSlice({
   name: "project",
   initialState,
   reducers: {},
   extraReducers: (builder) => {
      builder
         .addCase(fetchProjects.pending, (state) => {
            state.status = "loading";
         })
         .addCase(fetchProjects.fulfilled, (state, action) => {
            state.status = "succeeded";
            state.projects = action.payload;
         })
         .addCase(fetchProjects.rejected, (state, action) => {
            state.status = "failed";
            state.error = action.error.message;
         });
   },
});

export default projectSlice.reducer;
