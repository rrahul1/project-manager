import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectCount } from "../../slices/ProjectCountSlice";

const Analytics = () => {
   const dispatch = useDispatch();
   const { counts, status, error } = useSelector((state) => state.projectCount);
   const token = localStorage.getItem("token");

   useEffect(() => {
      if (token) {
         dispatch(fetchProjectCount(token));
      }
   }, [dispatch, token]);

   console.log(counts);

   if (status === "loading") return <p>Loading project count...</p>;
   if (status === "failed") return <p>Error: {error}</p>;

   return (
      <div>
         <h1>Analytics</h1>
         <p>Priority Counts:</p>
         <ul>
            {counts.priorityCounts.map((priority) => (
               <li key={priority.priority}>
                  {priority.priority}: {priority.count}
               </li>
            ))}
         </ul>

         <p>Status Counts:</p>
         <ul>
            {counts.statusCounts.map((status) => (
               <li key={status.status}>
                  {status.status}: {status.count}
               </li>
            ))}
         </ul>

         <p>Due Date Counts:</p>
         <ul>
            <li>Overdue: {counts.dueDateCounts.overdue}</li>
            <li>Due Today: {counts.dueDateCounts.dueToday}</li>
            <li>Due This Week: {counts.dueDateCounts.dueThisWeek}</li>
            <li>Due This Month: {counts.dueDateCounts.dueThisMonth}</li>
         </ul>
      </div>
   );
};

export default Analytics;
