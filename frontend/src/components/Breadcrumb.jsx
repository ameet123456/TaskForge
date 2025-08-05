import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Breadcrumb = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const paths = location.pathname.split("/").filter(Boolean);

  const handleNavigate = (index) => {
    const routeTo = "/" + paths.slice(0, index + 1).join("/");
    navigate(routeTo);
  };

  return (
    <nav className="text-sm text-gray-600 my-4">
      <ol className="list-none flex flex-wrap items-center">
        <li
          className="cursor-pointer text-white hover:underline"
          onClick={() => navigate("/")}
        >
          Home
        </li>

        {paths.map((path, index) => {
          const name =
            path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

          return (
            <li key={index} className="flex items-center">
              <span className="mx-2">/</span>
              <span
                onClick={() => handleNavigate(index)}
                className="cursor-pointer text-white hover:underline"
              >
                {name}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
