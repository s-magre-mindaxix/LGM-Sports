import { useState, useEffect } from "react";

// This function safely decodes the JWT payload
const parseJwt = (token: string) => {
  try {
    // Decode the base64url part of the token
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
};

export const useUserRole = (): string | null => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // This is the standard claim type for Role in ASP.NET Core Identity JWTs
    const ROLE_CLAIM_TYPE =
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

    const token = sessionStorage.getItem("token");
    if (token) {
      const decodedToken = parseJwt(token);

      // Access the role using the full claim type name with bracket notation
      if (decodedToken && decodedToken[ROLE_CLAIM_TYPE]) {
        setRole(decodedToken[ROLE_CLAIM_TYPE]);
      } else {
        console.warn(`Role claim ('${ROLE_CLAIM_TYPE}') not found in JWT.`);
      }
    }
  }, []);

  return role;
};
