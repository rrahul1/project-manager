import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects } from "../../slices/ProjectSlice";

const Home = () => {
   const dispatch = useDispatch();
   const { projects, status, error } = useSelector((state) => state.project);

   const token = localStorage.getItem("token");

   useEffect(() => {
      const filter = "all";
      dispatch(fetchProjects({ filter, token }));
   }, [dispatch]);

   if (status === "loading") return <p>Loading projects...</p>;
   if (status === "failed") return <p>Error: {error}</p>;

   return (
      <div>
         <h1>Projects</h1>
         {projects && projects.length > 0 ? (
            <ul>
               {projects.map((project) => (
                  <li key={project._id}>{project.title}</li>
               ))}
            </ul>
         ) : (
            <p>No projects found.</p>
         )}
      </div>
   );
};

export default Home;
