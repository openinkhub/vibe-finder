import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Pre-generated before/after makeup looks. Kept in its own module so pages that only need the
// data don't pull the Look Lab's 3D / face-tracking code into the main bundle.
export const useShowcase = () => {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/studio/showcase", { timeout: 180000 }).then((r) => setData(r.data)).catch(() => setData({ before: "/sample-face.jpg", looks: [] })); }, []);
  return data;
};
