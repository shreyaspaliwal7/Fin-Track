'use Client'
import { createContext, useContext, useState, useEffect } from "react";
import { client } from "@/api/client";
import { useRouter } from "next/navigation";

const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true)
    useEffect(() => {
        client.auth.getSession().then(({data})=>{
            setUser(data?.session?.user||null);
            setLoading(false);
        })

        const {data:listener} = client.auth.onAuthStateChange((e,session)=>{
            setUser(session?.user||null);
        })

        return ()=>{
            listener.subscription.unsubscribe();
        }
    }, []);
    return <AuthContext.Provider value={{ user, setUser }}>
        {children}
    </AuthContext.Provider>
};

export {AuthContext,AuthProvider}