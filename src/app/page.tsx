"use client"
import { sleep50s } from "@/components/action";
import { useEffect, useState } from "react";


const Home = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    sleep50s().then(setMessage);
  }, []);

  return <div>{message}</div>;
};

export default Home;