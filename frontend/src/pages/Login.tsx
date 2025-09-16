import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    localStorage.setItem("userEmail", email);
    toast.success("Email successfully saved!");
    navigate("/upload");
  };

  return (
    <Layout>
      <div className="card w-120 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-[var(--color-logo-yellow)] text-2xl">
            Login
          </h2>
          <form onSubmit={handleSubmit} className="form-control space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="input input-bordered w-full mb-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="text-error text-sm pt-1">{error}</p>}
            <button type="submit" className="btn btn-primary w-full mt-10">
              Continue
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
