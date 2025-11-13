import { useAuth } from '../context/AuthContext';

const useRoleAccess = (requiredRoles = []) => {
  const { user } = useAuth();
  
  if (!user) return { hasAccess: false, isAdmin: false };
  
  const hasAccess = requiredRoles.length === 0 || 
                   requiredRoles.includes(user.role) || 
                   user.role === 'super_admin';
  
  return {
    hasAccess,
    isAdmin: user.role === 'admin' || user.role === 'super_admin',
    isSuperAdmin: user.role === 'super_admin'
  };
};

export default useRoleAccess;
