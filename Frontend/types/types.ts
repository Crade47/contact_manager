import { ChangeEvent } from "react";

export interface UserData{
    username?:string,
    email:string,
    password:string
}

export interface UserContextValue {
    cookies: {
      token: string | undefined;
    },
    Login: (userData: UserData) => void,
    Logout: () => void,
    handleFormChange: (event: ChangeEvent<HTMLInputElement>, setFormData: React.Dispatch<React.SetStateAction<UserData>>) => void,
    errorState: string | null,
    isLoading: boolean,
  };

export interface Contact{

  createdAt:Date,
  email:string,
  name: string,
  phone: string
  updatedAt:Date,
  user_id:string,
}