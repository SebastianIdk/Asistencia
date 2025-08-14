export interface PUCEUser {
  record: string;
  id: string;
  lastnames: string;
  names: string;
  mail: string;
  phone: string;
  user: string;
}

export const getCurrentUser = (): PUCEUser | null => {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? (JSON.parse(raw) as PUCEUser) : null;
  } catch {
    return null;
  }
};

export const isLoggedIn = () => !!getCurrentUser();

export const logout = () => localStorage.removeItem("currentUser");
