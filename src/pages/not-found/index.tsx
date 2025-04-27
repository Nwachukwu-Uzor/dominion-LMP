import { Container } from "@/components/shared";
import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <Container>
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-100">
        <div className="p-8 text-center">
          <h1 className="mb-4 text-6xl font-bold text-gray-800">404</h1>
          <p className="mb-6 text-xl text-gray-600">Oops! Page not found.</p>
          <Link
            to="/"
            className="inline-block rounded bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary/70"
          >
            Go Home
          </Link>
        </div>
      </div>
    </Container>
  );
};

export default NotFound;
