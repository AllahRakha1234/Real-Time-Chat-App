// src/components/ErrorElement.jsx
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

const ErrorElement = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl font-bold text-red-600">
          Oops! {error.status}
        </h1>
        <p className="text-xl text-gray-700 mt-2">{error.statusText}</p>
        <p className="text-md text-gray-500 mt-1">{error.data}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-3xl font-bold text-red-600">Something went wrong</h1>
      <p className="text-md text-gray-700 mt-2">
        {error instanceof Error
          ? error.message
          : "An unexpected error occurred."}
      </p>
    </div>
  );
};

export default ErrorElement;
