import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ManageUsers(){
      const [loading, setLoading] = useState(true);
      const { token } = useAuth();
}