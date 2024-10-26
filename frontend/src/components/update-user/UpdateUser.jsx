import { useEffect, useState } from "react";
import axios from "axios";
import { updateUser } from "../../services/Api";
import lockIcon from "../../assets/icons/lock.svg";
import userIcon from "../../assets/icons/user.svg";
import viewIcon from "../../assets/icons/viewpassword.svg";
import emailIcon from "../../assets/icons/email.svg";
import styles from "./Updateuser.module.css";

const UpdateUser = () => {
   const [formData, setFormData] = useState({
      name: "",
      email: "",
      newPassword: "",
      oldPassword: "",
   });

   const token = localStorage.getItem("token");

   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [loading, setLoading] = useState(false);
   const [user, setUser] = useState(null);

   useEffect(() => {
      axios
         .get("http://localhost:5000/api/auth/get-user", {
            headers: { Authorization: `Bearer ${token}` },
         })
         .then((response) => setUser(response.data))
         .catch((error) => console.error("Error fetching user data:", error));
   }, [token]);

   const userId = user?.user?._id;

   console.log(userId);

   const [errors, setErrors] = useState({
      name: "",
      email: "",
      newPassword: "",
      oldPassword: "",
   });

   const validateForm = () => {
      let valid = true;
      const newErrors = {
         name: "",
         email: "",
         newPassword: "",
         oldPassword: "",
      };

      const filledFields = Object.keys(formData).filter(
         (key) => formData[key].trim() !== ""
      );
      if (filledFields.length > 1) {
         Object.keys(newErrors).forEach(
            (key) =>
               (newErrors[key] = "Only one field can be updated at a time.")
         );
         valid = false;
      } else {
         if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
            valid = false;
         }
         if (formData.newPassword && formData.newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters";
            valid = false;
         }
      }

      setErrors(newErrors);
      return valid;
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });

      const newErrors = { ...errors };

      if (name === "name" && value.trim() !== "") {
         newErrors.name = "";
      }

      if (name === "email") {
         const emailRegex = /\S+@\S+\.\S+/;
         if (emailRegex.test(value)) {
            newErrors.email = "";
         }
      }

      if (name === "password" && value.length >= 6) {
         newErrors.password = "";
      }

      if (name === "confirmPassword" && value === formData.password) {
         newErrors.confirmPassword = "";
      }

      setErrors(newErrors);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      if (validateForm()) {
         try {
            await updateUser({ formData, userId });
         } catch (error) {
            console.log(error);
         } finally {
            setLoading(false);
         }
      } else {
         setLoading(false);
      }
   };

   return (
      <div className={styles.update}>
         <form className={styles.authForm} onSubmit={handleSubmit}>
            <label htmlFor="name">
               <img src={userIcon} alt="user-icon" />
               <input
                  type="text"
                  placeholder="Name"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
               />
            </label>
            {errors.name && <p className={styles.error}>{errors.name}</p>}

            <label htmlFor="email">
               <img src={emailIcon} alt="email-icon" />
               <input
                  type="email"
                  placeholder="Update Email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
               />
            </label>
            {errors.email && <p className={styles.error}>{errors.email}</p>}

            <label htmlFor="confirm-password">
               <img src={lockIcon} alt="lock" />
               <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Old Password"
                  name="oldPassword"
                  id="confirm-password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
               />
               <img
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  src={viewIcon}
                  alt="view"
               />
            </label>
            {errors.confirmPassword && (
               <p className={styles.error}>{errors.confirmPassword}</p>
            )}

            <label htmlFor="password">
               <img src={lockIcon} alt="lock" />
               <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  name="newPassword"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
               />
               <img
                  onClick={() => setShowPassword(!showPassword)}
                  src={viewIcon}
                  alt="view"
               />
            </label>
            {errors.password && (
               <p className={styles.error}>{errors.password}</p>
            )}

            <button className={styles.authBtn} type="submit" disabled={loading}>
               {loading ? "Updating..." : "Update"}
            </button>
         </form>
      </div>
   );
};

export default UpdateUser;
