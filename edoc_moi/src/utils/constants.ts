export const CLIENT_ID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
export const CLIENT_SECRET: string = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "";

export const fonts: { name: string; value: String }[] = [
  {
    name: "Arial",
    value: "Arial",
  },
  {
    name: "Perfect Signature",
    value: "Perfect Signature",
  },
  {
    name: "Times New Roman",
    value: "Times New Roman",
  },
  {
    name: "Yustine Signature",
    value: "Yustine Signature",
  },
  {
    name: "Roboto",
    value: "Roboto",
  },
  {
    name: "Madinah Authentic",
    value: "Madinah Authentic",
  },
  {
    name: "Helvetica",
    value: "Helvetica",
  },
  {
    name: "MrDakota",
    value: "MrDakota",
  },
  {
    name: "Montserrat",
    value: "Montserrat",
  },
];

export const EXPRIRES_LOGIN = 24 * 60 * 60;
