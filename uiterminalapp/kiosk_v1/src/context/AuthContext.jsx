import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    // if (username === 'user' && password === 'user123') {
    //   setUser({ username, role: 'user' });
    //   return true;
    // } else 
    if (username === 'operator' && password === 'operator123') {
      setUser({ username, role: 'operator' });
      return true;
    } else {
      // setUser({ username, role: 'user' });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// import React, { createContext, useState, useContext } from 'react';

// const AuthContext = createContext();

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   const login = (username, password) => {
//     // Всегда позволяем войти с ролью user
//     // Только для operator требуется правильный пароль
//     if (username === 'operator' && password === 'operator123') {
//       setUser({ username, role: 'operator' });
//       return true;
//     } else {
//       // Для всех остальных - автоматически user
//       const userRole = username === 'operator' ? 'user' : 'user';
//       setUser({ username, role: userRole });
//       return true;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//   };

//   // Функция для автоматического входа как user (без пароля)
//   const loginAsUser = (username) => {
//     setUser({ username, role: 'user' });
//     return true;
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, loginAsUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };