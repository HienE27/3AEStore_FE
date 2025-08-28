// import { jwtDecode } from "jwt-decode";
// import { JwtPayload as DefaultJwtPayload } from "jwt-decode";

// interface JwtPayload extends DefaultJwtPayload {
//    avatar?: string;
//    lastName?: string;
//    firstName?: string;
//    email?: string;
//    id?: string;
//    role?: string;
// }

// export function isTokenExpired(token: string) {
//    const decodedToken = jwtDecode(token);
    
//    if (!decodedToken.exp) {
//       // Token không có thời gian hết hạn (exp)
//       return false;
//    }

//    const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

//    return currentTime < decodedToken.exp;
// }

// export function isToken() {
//    const token = localStorage.getItem('token');
//    if (token) {
//       return true;
//    }
//    return false;
// }

// export function getAvatarByToken() {
//    const token = localStorage.getItem('token');
//    if (token) {
//       const decodedToken = jwtDecode(token) as JwtPayload;
//       return decodedToken.avatar;
//    }
// }

// export function getFirstNameByToken() {
//    const token = localStorage.getItem('token');
//    if (token) {
//       const decodedToken = jwtDecode(token) as JwtPayload;
//       return decodedToken.firstName;
//    }
// }

// export function getLastNameByToken() {
//    const token = localStorage.getItem('token');
//    if (token) {
//       const decodedToken = jwtDecode(token) as JwtPayload;
//       return decodedToken.lastName;
//    }
// }

// export function getUsernameByToken() {
//    const token = localStorage.getItem('token');
//    if (token) {
//       return jwtDecode(token).sub;
//    }
// }

// // NEW: Get email from token
// export function getCustomerEmailFromToken() {
//    const token = localStorage.getItem('token');
//    if (token) {
//       const decodedToken = jwtDecode(token) as JwtPayload;
//       // Try email field first, then fall back to sub (username)
//       return decodedToken.email || decodedToken.sub;
//    }
// }

// export function getIdUserByToken() {
//    const token = localStorage.getItem('token');
//    if (token) {
//       const decodedToken = jwtDecode(token) as JwtPayload;
//       return decodedToken.id;
//    }
// }

// export function getRoleByToken() {
//    const token = localStorage.getItem('token');
//    if (token) {
//       const decodedToken = jwtDecode(token) as JwtPayload;
//       return decodedToken.role;
//    }
// }

// // NEW: Get full user info from token
// export function getUserInfoFromToken() {
//    const token = localStorage.getItem('token');
//    if (token) {
//       const decodedToken = jwtDecode(token) as JwtPayload;
//       return {
//          id: decodedToken.id,
//          email: decodedToken.email || decodedToken.sub,
//          firstName: decodedToken.firstName,
//          lastName: decodedToken.lastName,
//          avatar: decodedToken.avatar,
//          role: decodedToken.role,
//          username: decodedToken.sub
//       };
//    }
//    return null;
// }

// // NEW: Check if user is authenticated
// export function isAuthenticated() {
//    const token = localStorage.getItem('token');
//    if (!token) return false;
   
//    try {
//       return !isTokenExpired(token);
//    } catch (error) {
//       console.error('Error checking authentication:', error);
//       return false;
//    }
// }

// export function logout(navigate: any) {
//    navigate("/login");
//    localStorage.removeItem('token');
//    localStorage.removeItem('cart');
// }







import { jwtDecode } from "jwt-decode";
import { JwtPayload as DefaultJwtPayload } from "jwt-decode";

interface JwtPayload extends DefaultJwtPayload {
   avatar?: string;
   lastName?: string;
   firstName?: string;
   email?: string;
   id?: string;
   role?: string;
}

// FIX: Sửa logic kiểm tra token hết hạn
export function isTokenExpired(token: string): boolean {
   try {
      const decodedToken = jwtDecode(token);
      
      if (!decodedToken.exp) {
         // Token không có thời gian hết hạn (exp) - coi như không hết hạn
         return false;
      }

      const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

      // FIX: Logic đúng - token hết hạn nếu currentTime > exp
      return currentTime > decodedToken.exp;
   } catch (error) {
      console.error('Error decoding token:', error);
      return true; // Token lỗi thì coi như hết hạn
   }
}

export function isToken(): boolean {
   const token = localStorage.getItem('token');
   if (token) {
      // Kiểm tra token có hết hạn không
      return !isTokenExpired(token);
   }
   return false;
}

export function getAvatarByToken(): string | undefined {
   const token = localStorage.getItem('token');
   if (token && !isTokenExpired(token)) {
      try {
         const decodedToken = jwtDecode(token) as JwtPayload;
         return decodedToken.avatar;
      } catch (error) {
         console.error('Error decoding token for avatar:', error);
         return undefined;
      }
   }
   return undefined;
}

export function getFirstNameByToken(): string | undefined {
   const token = localStorage.getItem('token');
   if (token && !isTokenExpired(token)) {
      try {
         const decodedToken = jwtDecode(token) as JwtPayload;
         return decodedToken.firstName;
      } catch (error) {
         console.error('Error decoding token for firstName:', error);
         return undefined;
      }
   }
   return undefined;
}

export function getLastNameByToken(): string | undefined {
   const token = localStorage.getItem('token');
   if (token && !isTokenExpired(token)) {
      try {
         const decodedToken = jwtDecode(token) as JwtPayload;
         return decodedToken.lastName;
      } catch (error) {
         console.error('Error decoding token for lastName:', error);
         return undefined;
      }
   }
   return undefined;
}

export function getUsernameByToken(): string | undefined {
   const token = localStorage.getItem('token');
   if (token && !isTokenExpired(token)) {
      try {
         const decodedToken = jwtDecode(token) as JwtPayload;
         return decodedToken.sub;
      } catch (error) {
         console.error('Error decoding token for username:', error);
         return undefined;
      }
   }
   return undefined;
}

// Get email from token
export function getCustomerEmailFromToken(): string | undefined {
   const token = localStorage.getItem('token');
   if (token && !isTokenExpired(token)) {
      try {
         const decodedToken = jwtDecode(token) as JwtPayload;
         // Try email field first, then fall back to sub (username)
         return decodedToken.email || decodedToken.sub;
      } catch (error) {
         console.error('Error decoding token for email:', error);
         return undefined;
      }
   }
   return undefined;
}

export function getIdUserByToken(): string | undefined {
   const token = localStorage.getItem('token');
   if (token && !isTokenExpired(token)) {
      try {
         const decodedToken = jwtDecode(token) as JwtPayload;
         return decodedToken.id;
      } catch (error) {
         console.error('Error decoding token for ID:', error);
         return undefined;
      }
   }
   return undefined;
}

export function getRoleByToken(): string | undefined {
   const token = localStorage.getItem('token');
   if (token && !isTokenExpired(token)) {
      try {
         const decodedToken = jwtDecode(token) as JwtPayload;
         return decodedToken.role;
      } catch (error) {
         console.error('Error decoding token for role:', error);
         return undefined;
      }
   }
   return undefined;
}

// Get full user info from token
export function getUserInfoFromToken(): {
   id?: string;
   email?: string;
   firstName?: string;
   lastName?: string;
   avatar?: string;
   role?: string;
   username?: string;
} | null {
   const token = localStorage.getItem('token');
   if (token && !isTokenExpired(token)) {
      try {
         const decodedToken = jwtDecode(token) as JwtPayload;
         return {
            id: decodedToken.id,
            email: decodedToken.email || decodedToken.sub,
            firstName: decodedToken.firstName,
            lastName: decodedToken.lastName,
            avatar: decodedToken.avatar,
            role: decodedToken.role,
            username: decodedToken.sub
         };
      } catch (error) {
         console.error('Error decoding token for user info:', error);
         return null;
      }
   }
   return null;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
   const token = localStorage.getItem('token');
   if (!token) return false;
   
   try {
      return !isTokenExpired(token);
   } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
   }
}

// FIX: Thêm type cho navigate parameter
export function logout(navigate: (path: string) => void): void {
   navigate("/login");
   localStorage.removeItem('token');
   localStorage.removeItem('cart');
   localStorage.removeItem('wishlist'); // Clear wishlist on logout
}

// NEW: Utility function để validate token format
export function isValidTokenFormat(token: string): boolean {
   try {
      // JWT token phải có 3 phần separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Try to decode header and payload
      JSON.parse(atob(parts[0]));
      JSON.parse(atob(parts[1]));
      
      return true;
   } catch (error) {
      return false;
   }
}

// NEW: Safe token getter with validation
export function getValidToken(): string | null {
   const token = localStorage.getItem('token');
   
   if (!token) return null;
   if (!isValidTokenFormat(token)) {
      console.warn('Invalid token format detected, removing...');
      localStorage.removeItem('token');
      return null;
   }
   if (isTokenExpired(token)) {
      console.warn('Expired token detected, removing...');
      localStorage.removeItem('token');
      return null;
   }
   
   return token;
}