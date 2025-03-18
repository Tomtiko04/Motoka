import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import Success from "../../components/Success";

export default function VerificationSuccess() {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <br />
      <br />
      <Success />
    </>
  );
}
