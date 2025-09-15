import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const VerifyEmail = () => {
  const [message, setMessage] = useState("Verifying...");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setMessage("No verification token provided");
      return;
    }

    fetch(`http://localhost:5000/api/auth/verify-email?token=${token}`)
      .then(async res => {
        const data = await res.json();
        if (res.ok) {
          setMessage(data.message || "Email verified successfully!");
        } else {
          setMessage(data.message || "Verification failed");
        }
      })
      .catch(error => {
        console.error("Verification error:", error);
        setMessage("Verification failed due to network error");
      });
  }, [token]);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default VerifyEmail;