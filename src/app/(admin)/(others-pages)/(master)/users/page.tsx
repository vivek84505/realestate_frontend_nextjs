'use client'
import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import { format } from "date-fns";
import { useEffect } from "react";
import bcrypt from "bcryptjs";
import Alert from "@/components/ui/alert/Alert";
import { motion, AnimatePresence } from "framer-motion";

import { useForm ,Controller } from "react-hook-form";
 


 import { SearchIcon } from '@heroicons/react/solid'; // Import Heroicons search icon
 import { TrashIcon } from '@heroicons/react/outline'; // Import Heroicons search icon
 import { useState } from "react";
import maleImg from "/images/user/user/male.jpg"
import femaleImg from "/images/user/user/female.jpg"
import Image from "next/image";
import { fetchUsers,addNewUser,updateUserStatus,fetchUserById } from "@/rqueries/UsersQueryAll";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PencilAltIcon } from '@heroicons/react/outline'; // Import Heroicons search icon
import Label from "@/components/form/Label"; 
 import Select from "@/components/form/Select";
// import { CalenderIcon, ChevronDownIcon, EyeCloseIcon, EyeIcon, TimeIcon } from "../../../icons";
import {CalendarIcon,ChevronDownIcon, EyeIcon} from "@heroicons/react/solid";
 

type userDataType = {
  user_id:number,
  firstname:string,
  lastname:string,
  email:string,
  userrole:string,
  mobile:string,
 created_date:string,
 isactive:string
}

type userFormDataType = {    
  firstname: string;
  lastname: string;
  email: string;
  userrole: string;
  mobile: string;
};


type userListType = userDataType[];  

const options = [
    { value: "superadmin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
  ];

   
export default function UserMaster() {
const queryClient = useQueryClient(); // Add this line inside your component

const [isClicked, setIsClicked] = useState(false);
//  const { data, isLoading, isFetching, isError, error } = useQuery("fetch-users", fetchUsers);
const { data, isLoading, error } = useQuery({ queryKey: ["fetch-users"], queryFn: fetchUsers });
const [viewSelectedUser,setviewSelectedUser] = useState({});
const [selecteduser, setSelectedUser] = useState<Partial<userDataType>>({});
const [userlist, setUserList] = useState<userListType>([]);
const [searchterm,setSearchTerm] = useState("");
const [showaddform,setShowAddForm] = useState(false);
const [showdetailform,setShowDetailForm] = useState(true);
const [addformerror,setAddFormError] = useState("");
const [addformsuccess,setAddFormSuccess] = useState("");

 const form = useForm({
 
  mode: "onChange",  
  defaultValues: {
    firstname: "",
    lastname: "",
    email: "",
    mobile: "",
    userrole: "",
  },
    
});

const {
    register,
    handleSubmit,
    reset,
    formState: { errors }, // ✅ Extract errors
    control, // ✅ Needed for Select component
  } = useForm({
    mode: "onChange",
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      mobile: "",
      userrole: "",
    },
  });
 
  useEffect(() => {
  if (data?.data?.returnval?.length > 0) {
    setUserList(data?.data.returnval);
  }
    
  if (data?.data?.returnval?.length > 0) {
    setSelectedUser(data?.data.returnval[0]);
  }
}, [data]);


 useEffect(() => {
  const handler = setTimeout(() =>{
    if(searchterm.trim() === ""){
      setUserList(data?.data.returnval)
    }
    else{
      const filteredUsers = data?.data.returnval.filter((user:any) =>
        user.firstname.toLowerCase().includes(searchterm.toLowerCase())
      )
      setUserList(filteredUsers);
    }
  },300)
 },[searchterm,data?.data.returnval])

 useEffect(() => {
  setTimeout(() => {
    setAddFormError('');
    setAddFormSuccess('');
  }, 5000);
 },[addformerror,addformsuccess])

const changeSelecteduser = (userid: number) => {  

  const selectedUser = userlist.find((item) => item.user_id === userid);  
  setSelectedUser(selectedUser || {});
  setShowDetailForm(true);
  setShowAddForm(false);

};

// React Query - Mutation to Add User
  const { mutate: addUser, isPending: isAdding } = useMutation({
  mutationFn: async (userData: userFormDataType) => {
    return await addNewUser(userData);
  },
  onSuccess: (response) => {
    if (response.status.toLowerCase() === "success") {
       console.log("Success Response======>", response);
      setAddFormSuccess(response?.returnmsg);
      setAddFormError("");
      reset();       
    } else {
     console.log("Error Response======>", response);
      setAddFormError(response.returnmsg);
      setAddFormSuccess("");
    }
    queryClient.invalidateQueries({ queryKey: ["fetch-users"] });
  },
  onError: (error) => {
    console.error("Error adding user:", error);
  },
});

const { mutate: updateStatus, isPending: isUpdating } = useMutation({
  mutationFn: async (userStatusData: { user_id: string | number; isactive: string | number;lastmodifiedby: string; }) => {
          
 

    return await updateUserStatus(userStatusData);
  },
  onSuccess: (response,userStatusData) => {
    if (response.status.toLowerCase() === "success") {
   
       console.log("Success Updating User Status======>", response); 

    console.log("isactive 1 ======>", userStatusData.isactive);
    console.log("user_id 1======>", userStatusData.user_id);
     
          setSelectedUser((previousUser) => ({
          ...previousUser,
          isactive: userStatusData.isactive,
        } as Partial<userDataType>));

        setUserList((prevUserList) =>
  prevUserList.map((user) =>
    user.user_id === userStatusData.user_id
      ? { ...user, isactive: Number(userStatusData.isactive) } // Ensure isactive is a number
      : user
  ) as userListType // Explicitly cast to userListType
);


    } else {
         console.log("Error Updating User Status======>", response);
     
    }
    // queryClient.invalidateQueries({ queryKey: ["fetch-users"] });
  },
  onError: (error) => {
    console.error("Error updating user status:", error);
  },
});

 
 const userAddSubmit = (data: userFormDataType) => {
  console.log("Form submitted data ===>", data);
  addUser(data); // Calls the add user mutation
};

const userStatusUpdateSubmit = (data: { user_id: string | number; isactive: string | number; lastmodifiedby: string }) => {
  const updatedStatus = data.isactive == 1 ? 0 : 1; // Toggle isactive value

  const updatedData = { 
    ...data, 
    isactive: updatedStatus 
  };

  console.log("Updating user status ===>", updatedData);
  console.log("userlist ===>", userlist);
  updateStatus(updatedData); // Calls the update user status mutation with toggled value
};
  return (
   <div>
   {isLoading && (
     <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
         <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
   )}
   
  <PageBreadcrumb pageTitle="Users Management" />
  <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-4 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:py-8 md:px-10 md:py-12">
    <div className="flex flex-col  sm:flex-row gap-3">
    
      {/* User List Panel */}
    <div className="flex flex-col h-96 overflow-auto w-full sm:w-96 rounded-md border">
      
      <div className="flex justify-center p-2    ">
   <button onClick={ () => {setShowAddForm(true); setShowDetailForm(false)} } className="inline-flex items-center w-96 justify-center font-medium gap-2 rounded-lg transition  px-5 py-3.5 text-sm bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 ">
    Add New User
   </button>
      </div>
  {/* Search Bar */}
        <div className="relative p-4">
          <input
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}

            value={searchterm}
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <SearchIcon className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
        </div>

        {/* User List Items */}
        {userlist?.map((user: userDataType) => (
          <div
            key={user.user_id}
            onClick={() => changeSelecteduser(user.user_id)}
            className={`flex gap-2 h-14 relative cursor-pointer p-2 ${
              (user.user_id === selecteduser?.user_id) ? 'bg-blue-100' : 'hover:bg-gray-50'
            }`}
          >
             <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
           <Image
            width={44}
            height={44}
            src="/images/user/male.jpg"
            alt="User"
          />
          </span>
            <div className="flex flex-col justify-center">
              <span className="block font-semibold text-gray-700 text-sm dark:text-gray-400">
                {user?.firstname} {user?.lastname}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.userrole}</p>
            </div>
            <div className="absolute right-2 top-1/3 mr-2 flex">
             {
                (user?.isactive == '1') ? (
                <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-xs bg-success-500 text-white">
                Active
              </span>
                ): (
                  <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-xs bg-error-500 text-white dark:text-white">
                Inactive
              </span>
                )
              } 

            </div>
          </div>
        ))}
      </div>

      {/* Second Panel */}
            {/* User details Div start */}
      {
        showdetailform && (
<div className=" relative flex flex-col bg-blue-50 w-full sm:w-2/4  rounded-md border p-4">

  
      
        <div className="flex   w-full h-20 p-8  border-b border-gray-400">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/40">
            User Detail
          </h2>         
           <div className="absolute right-10 top-14 mr-8 flex">
              
              {
                (selecteduser?.isactive == '1') ? (
                <button onClick={() => userStatusUpdateSubmit({ user_id: selecteduser?.user_id ?? "" , isactive: selecteduser?.isactive ?? 0,lastmodifiedby:"admin@allcodebuzz.com" })} className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-xs bg-success-500 text-white">
                Active
              </button>
                ): (
                  <button onClick={() => userStatusUpdateSubmit({ user_id: selecteduser?.user_id ?? "" , isactive: selecteduser?.isactive ?? 0,lastmodifiedby:  "admin@allcodebuzz.com" })} className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium text-xs bg-error-500 text-white dark:text-white">
                Inactive
              </button>
                )
              }
              
              
            </div>
             <PencilAltIcon className="absolute w-5 right-10 top-14 mr-2 flex"/>
             <TrashIcon className="absolute right-6 top-16 transform -translate-y-1/2 text-gray-500 w-5 h-5" />

        </div>   

          <div className="flex   p-4">

            <div className="mr-3 overflow-hidden rounded-full h-14 w-14">
            <Image
              width={66}
              height={66}
              src="/images/user/male.jpg"
              alt="User"
            />
            </div>
              <div className="flex flex-col "> 
                  <div className="block font-semibold text-gray-700 text-lg dark:text-gray-400">
                      {selecteduser?.firstname}  {selecteduser?.lastname}
                  </div> 

              </div>
          </div>

          <div className="flex justify-between p-3"> 

              <div className="flex flex-col w-1/2">
                  <p className="text-md text-gray-500 dark:text-gray-400">Mobile</p>
                  <div className="block font-semibold text-gray-700 text-lg dark:text-gray-400">
                {selecteduser?.mobile}
                  </div>
              </div>

                <div className="flex flex-col w-1/2">
                  <p className="text-md text-gray-500 dark:text-gray-400">Email</p>
                  <div className="block font-semibold text-gray-700 text-lg dark:text-gray-400">
                  {selecteduser?.email}
                  </div>
                </div>  
          </div> 

        <div className="flex justify-between p-3"> 
              <div className="flex flex-col w-1/2">
                  <p className="text-md text-gray-500 dark:text-gray-400">Role</p>
                  <div className="block font-semibold text-gray-700 text-lg dark:text-gray-400">
                {selecteduser?.userrole}
                  </div>
              </div>

              <div className="flex flex-col w-1/2">
                <p className="text-md text-gray-500 dark:text-gray-400">Registered On</p>
                <div className="block font-semibold text-gray-700 text-lg dark:text-gray-400">
                {selecteduser?.created_date}
                </div>
              </div> 

        </div>
        </div>
        )
      }
      
        
        {/* User details Div end */}
     
              {/* User Add Div start */}

              {showaddform && (
 
            <div className=" relative flex flex-col bg-blue-50 w-full sm:w-2/4  rounded-md border p-4">

        <div className="space-y-6">
          
          <AnimatePresence>
          {addformerror && (
          <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          >
          <Alert variant="error" title={addformerror} message="" />
          </motion.div>
          )}
          </AnimatePresence>


          <AnimatePresence>
          {addformsuccess && (
          <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          >
          <Alert variant="success" title={addformsuccess} message="" />
          </motion.div>
          )}
          </AnimatePresence>
          

          


           <form onSubmit={handleSubmit(userAddSubmit)} noValidate>
      {/* Firstname */}
      <div>
        <Label>Firstname</Label>
        <input
          type="text"
          className={`input-field ${errors.firstname ? "input-error" : ""}`}
          {...register("firstname", { required: "Firstname is required" })}
        />
        {errors.firstname && (
          <p className="mt-2 text-sm text-error-500">{errors.firstname.message}</p>
        )}
      </div>

      {/* Lastname */}
      <div>
        <Label>Lastname</Label>
        <input
          type="text"
          className={`input-field ${errors.lastname ? "input-error" : ""}`}
          {...register("lastname", { required: "Lastname is required" })}
        />
        {errors.lastname && (
          <p className="mt-2 text-sm text-error-500">{errors.lastname.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label>Email</Label>
        <input
          type="text"
          className={`input-field ${errors.email ? "input-error" : ""}`}
          {...register("email", { required: "Email is required" })}
        />
        {errors.email && (
          <p className="mt-2 text-sm text-error-500">{errors.email.message}</p>
        )}
      </div>

      {/* Mobile */}
      <div>
        <Label>Mobile</Label>
        <input
          type="text"
          className={`input-field ${errors.mobile ? "input-error" : ""}`}
          {...register("mobile", { required: "Mobile is required" })}
        />
        {errors.mobile && (
          <p className="mt-2 text-sm text-error-500">{errors.mobile.message}</p>
        )}
      </div>

      {/* User Role (Using Controller for react-select) */}
      <div>
        <Label>User Role</Label>
        <div className="relative">
          <Controller
            name="userrole"
            control={control}
            rules={{ required: "Role is required" }} // ✅ Validation
            render={({ field }) => (
              <Select
                {...field}
                options={options}
                placeholder="Select a role"
                className="dark:bg-dark-900"
              />
            )}
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
        {errors.userrole && (
          <p className="mt-2 text-sm text-error-500">{errors.userrole.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center p-2">
        <button
          type="submit"
          className="inline-flex items-center w-full justify-center font-medium gap-2 rounded-lg transition px-5 py-3.5 text-md bg-brand-500 text-white shadow-theme-md hover:bg-brand-600 disabled:bg-brand-300"
        >
          Submit
        </button>
      </div>
    </form>
        <div>
           
        </div>
        <div>
          
        </div>
        <div>
         
        </div>
        
      </div>
        </div>  
        
              )}
             
              {/* User Add Div end */}
           
           
  




    </div>
  </div>
</div>
  );
}
