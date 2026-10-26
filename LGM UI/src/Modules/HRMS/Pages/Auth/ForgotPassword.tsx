import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import GaxceLogo from "../../../../assets/Gaxce-Sensors-Logo.png";
import { forgotPassword } from "./AuthService";
import { toast } from "sonner";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const response = await forgotPassword({ email });
      toast.success(response.message);
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {submitted ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">
              Check your email
            </h2>
            <p className="text-gray-500">
              If an account with the email{" "}
              <span className="font-medium text-gray-700">{email}</span> exists,
              we have sent a password reset link.
            </p>
            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <img
                src={GaxceLogo}
                alt="Gaxce Sensors Logo"
                className="w-48 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-800">
                Forgot Password?
              </h2>
              <p className="text-gray-500">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  ) : null}
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-500"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
      <p className="mt-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Gaxce Sensor. All rights reserved.
      </p>
    </div>
  );
};

export default ForgotPassword;
