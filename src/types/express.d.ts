declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        correo?: string;
        nombre?: string;
        permissions?: string[];
      };
    }
  }
}

export {};
