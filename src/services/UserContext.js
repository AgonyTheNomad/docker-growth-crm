import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../services/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { allowedEmails } from '../utils/allowedEmails';

// Create User Context with default values
export const UserContext = createContext({
    user: null,
    setUser: () => {},
    userId: '',
    setUserId: () => {},
    userEmail: '',
    setUserEmail: () => {},
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    userName: '',
    setUserName: () => {},
    userPhoto: '',
    setUserPhoto: () => {},
    userRole: '',
    setUserRole: () => {},
    subRole: null,
    setSubRole: () => {},
    loading: true,
    error: null,
    logout: () => {},
    updateUserRole: () => {},
});

// Utility function to derive role, subRole, and name based on email
export const deriveRoleAndSubRole = (email) => {
    try {
        console.log(`Deriving role and subRole for email: ${email}`);

        // Check for multi-role members
        const multiRoleMember = allowedEmails.find((entry) =>
            entry.members?.some((member) => member.email === email && member.roles)
        );

        if (multiRoleMember) {
            const member = multiRoleMember.members.find((member) => member.email === email);
            console.log('Multi-role member found:', { email, roles: member.roles, name: member.name });
            return {
                isMultiRole: true,
                roles: member.roles.map(r => r.role),
                subRoles: member.roles.map(r => r.subRole),
                name: member.name
            };
        }

        // Check for single-role members
        const singleRoleEntry = allowedEmails.find(
            (entry) =>
                entry.emails?.includes(email) ||
                entry.members?.some((member) => member.email === email)
        );

        if (singleRoleEntry) {
            if (singleRoleEntry.members) {
                const member = singleRoleEntry.members.find((member) => member.email === email);
                if (!member) {
                    console.warn(`⚠️ No member found for email: ${email}`);
                } else {
                    console.log('✅ Found correct single-role member:', member);
                }

                return {
                    isMultiRole: false,
                    role: singleRoleEntry.role,
                    subRole: singleRoleEntry.subRole || null,
                    name: member?.name || email.split('@')[0],  // Ensure fallback to the correct name
                };
            }

            return {
                isMultiRole: false,
                role: singleRoleEntry.role,
                subRole: singleRoleEntry.subRole || null,
                name: email.split('@')[0],
            };
        }

        // Default fallback
        console.warn(`⚠️ Email not found in allowedEmails: ${email}`);
        return { 
            isMultiRole: false, 
            role: 'user', 
            subRole: null, 
            name: email.split('@')[0] 
        };
    } catch (error) {
        console.error('🔥 Error deriving role:', { email, error });
        return { 
            isMultiRole: false, 
            role: 'user', 
            subRole: null, 
            name: email.split('@')[0] 
        };
    }
};




export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userPhoto, setUserPhoto] = useState('');
    const [userRole, setUserRole] = useState('');
    const [subRole, setSubRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const saveUserToStorage = useCallback((userData) => {
        try {
            if (userData) {
                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        uid: userData.uid,
                        email: userData.email,
                        displayName: userData.displayName,
                        photoURL: userData.photoURL,
                    })
                );
                sessionStorage.setItem('isLoggedIn', 'true');
            }
        } catch (error) {
            console.error('Error saving user data to storage:', error);
        }
    }, []);

    const clearUserFromStorage = useCallback(() => {
        try {
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            localStorage.removeItem('subRole');
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('userEmail');
        } catch (error) {
            console.error('Error clearing user data from storage:', error);
        }
    }, []);

    const updateUserRole = useCallback(async (email) => {
        try {
            const { isMultiRole, roles, subRoles, role, subRole: newSubRole, name } =
                deriveRoleAndSubRole(email);

            if (isMultiRole) {
                setUserRole(roles);
                setSubRole(subRoles);
                localStorage.setItem('userRole', JSON.stringify(roles));
                localStorage.setItem('subRole', JSON.stringify(subRoles));
            } else {
                setUserRole(role);
                setSubRole(newSubRole);
                localStorage.setItem('userRole', role);
                localStorage.setItem('subRole', newSubRole);
            }

            setUserName(name); // Update name
        } catch (error) {
            console.error('Error updating user role:', error);
            setError('Failed to update user role');
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserId('');
            setUserEmail('');
            setIsLoggedIn(false);
            setUserName('');
            setUserPhoto('');
            setUserRole('');
            setSubRole(null);
            clearUserFromStorage();
        } catch (error) {
            console.error('Error during logout:', error);
            setError('Failed to logout');
        }
    }, [clearUserFromStorage]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                setLoading(true);
                if (firebaseUser) {
                    const email = firebaseUser.email;

                    const {
                        isMultiRole,
                        roles,
                        subRoles,
                        role,
                        subRole: newSubRole,
                        name,
                    } = deriveRoleAndSubRole(email);

                    setUser(firebaseUser);
                    setUserId(firebaseUser.uid);
                    setUserEmail(email);
                    setIsLoggedIn(true);
                    setUserName(name); // Use derived name
                    setUserPhoto(firebaseUser.photoURL || '');

                    if (isMultiRole) {
                        setUserRole(roles);
                        setSubRole(subRoles);
                        localStorage.setItem('userRole', JSON.stringify(roles));
                        localStorage.setItem('subRole', JSON.stringify(subRoles));
                    } else {
                        setUserRole(role);
                        setSubRole(newSubRole);
                        localStorage.setItem('userRole', role);
                        localStorage.setItem('subRole', newSubRole);
                    }

                    saveUserToStorage({
                        uid: firebaseUser.uid,
                        email: email,
                        displayName: name,
                        photoURL: firebaseUser.photoURL,
                    });
                } else {
                    setUser(null);
                    setUserId('');
                    setUserEmail('');
                    setIsLoggedIn(false);
                    setUserName('');
                    setUserPhoto('');
                    setUserRole('');
                    setSubRole(null);
                    clearUserFromStorage();
                }
                setError(null);
            } catch (error) {
                console.error('Error in auth state change:', error);
                setError('Authentication error occurred');
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [saveUserToStorage, clearUserFromStorage]);

    const value = {
        user,
        setUser,
        userId,
        setUserId,
        userEmail,
        setUserEmail,
        isLoggedIn,
        setIsLoggedIn,
        userName,
        setUserName,
        userPhoto,
        setUserPhoto,
        userRole,
        setUserRole,
        subRole,
        setSubRole,
        loading,
        error,
        logout,
        updateUserRole,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a UserProvider');
    }
    return context;
};
