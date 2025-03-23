import axios from "axios";
import bcrypt from "bcryptjs";

type userFormDataType = {   
  firstname: string;
  lastname: string;
  email: string;
  userrole: string;
  mobile: string;
};

type userStatusType = {   
  user_id: string | number;
  isactive: number | string;
  lastmodifiedby: string;
 
};



export const fetchUsers = () => {
  return axios.post("http://localhost:8000/api/getusers");
};

export const fetchUserById = async (userId:number) => {
  if (!userId) return null;
  const response = await axios.post("http://localhost:8000/api/getusers", { user_id: userId.toString() });
  return response.data;
};

 export const addNewUser = async (userData: userFormDataType): Promise<any> => {
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(userData.mobile, salt);

  const response = await axios.post("http://localhost:8000/api/adduser", { ...userData });
  return response.data; // Ensure correct return type
};


 export const updateUserStatus = async (userData: userStatusType): Promise<any> => {
  

  const response = await axios.post("http://localhost:8000/api/updateUserStatus", { ...userData });
  return response.data; // Ensure correct return type
};