import { useRouteError } from "react-router-dom";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError() as Error;
  console.error(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-2">
          {error.message || "An unexpected error occurred"}
        </p>
        <p className="text-sm text-gray-500 mb-6">
          We're working to fix this. Please try again later.
        </p>
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;