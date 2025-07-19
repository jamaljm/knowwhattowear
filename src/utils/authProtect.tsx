"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Spinner } from "@nextui-org/react";
// import Loader from "@/components/layout/Loader";

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const AuthProtect: React.FC<P> = (props) => {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    useEffect(() => {
      const fetchData = async () => {
        try {
          const { data, error } = await supabase.auth.getSession();
          setUser(data.session);
          if (!data.session) {
            router.push("/login");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };

      fetchData();
    }, [router]);

   
    return <WrappedComponent {...props} />;
  };

  return AuthProtect;
};

export default withAuth;
