import Project from "../models/project.model.js";
import mongoose from "mongoose";

// Helper function to get the start and end dates for today, this week, and this month
const getDateRanges = () => {
   const today = new Date();
   const startOfToday = new Date(today.setHours(0, 0, 0, 0));
   const endOfToday = new Date(today.setHours(23, 59, 59, 999));

   const startOfWeek = new Date(startOfToday);
   startOfWeek.setDate(today.getDate() - today.getDay());

   const endOfWeek = new Date(startOfWeek);
   endOfWeek.setDate(endOfWeek.getDate() + 6);

   const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
   const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

   return {
      startOfToday,
      endOfToday,
      startOfWeek,
      endOfWeek,
      startOfMonth,
      endOfMonth,
   };
};

export const getProjectCounts = async (userId) => {
   try {
      const {
         startOfToday,
         endOfToday,
         startOfWeek,
         endOfWeek,
         startOfMonth,
         endOfMonth,
      } = getDateRanges();

      const counts = await Project.aggregate([
         {
            $match: { createdBy: mongoose.Types.ObjectId(userId) },
         },
         {
            $facet: {
               priorityCounts: [
                  {
                     $group: {
                        _id: "$priority",
                        count: { $sum: 1 },
                     },
                  },
                  {
                     $project: {
                        _id: 0,
                        priority: "$_id",
                        count: 1,
                     },
                  },
               ],
               statusCounts: [
                  {
                     $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                     },
                  },
                  {
                     $project: {
                        _id: 0,
                        status: "$_id",
                        count: 1,
                     },
                  },
               ],
               dueDateCounts: [
                  {
                     $facet: {
                        overdue: [
                           {
                              $match: {
                                 dueDate: { $lt: startOfToday },
                              },
                           },
                           {
                              $count: "count",
                           },
                        ],
                        dueToday: [
                           {
                              $match: {
                                 dueDate: {
                                    $gte: startOfToday,
                                    $lt: endOfToday,
                                 },
                              },
                           },
                           {
                              $count: "count",
                           },
                        ],
                        dueThisWeek: [
                           {
                              $match: {
                                 dueDate: {
                                    $gte: startOfToday,
                                    $lt: endOfWeek,
                                 },
                              },
                           },
                           {
                              $count: "count",
                           },
                        ],
                        dueThisMonth: [
                           {
                              $match: {
                                 dueDate: {
                                    $gte: startOfToday,
                                    $lt: endOfMonth,
                                 },
                              },
                           },
                           {
                              $count: "count",
                           },
                        ],
                     },
                  },
               ],
            },
         },
      ]);

      const formattedCounts = {
         priorityCounts: counts[0].priorityCounts,
         statusCounts: counts[0].statusCounts,
         dueDateCounts: {
            overdue: counts[0].dueDateCounts[0].overdue[0]?.count || 0,
            dueToday: counts[0].dueDateCounts[0].dueToday[0]?.count || 0,
            dueThisWeek: counts[0].dueDateCounts[0].dueThisWeek[0]?.count || 0,
            dueThisMonth:
               counts[0].dueDateCounts[0].dueThisMonth[0]?.count || 0,
         },
      };

      return formattedCounts;
   } catch (error) {
      throw new Error("Error fetching project counts: " + error.message);
   }
};
