import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const fetchUserProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await axios.get('/console/api/account/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const updateUserProfile = (updatedProfile) => {
    setUserProfile(prevProfile => ({
      ...prevProfile,
      ...updatedProfile
    }));
  };

  return (
    <UserContext.Provider value={{ userProfile, isLoadingProfile, updateUserProfile, fetchUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);