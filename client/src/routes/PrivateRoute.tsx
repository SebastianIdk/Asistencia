import React from "react";
import { Route, Redirect, RouteProps } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

interface Props extends RouteProps {
  component: React.ComponentType<any>;
}

const PrivateRoute: React.FC<Props> = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        isLoggedIn() ? <Component {...props} /> : <Redirect to="/login" />
      }
    />
  );
};

export default PrivateRoute;
