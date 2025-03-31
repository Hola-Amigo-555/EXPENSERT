
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center w-full">
        <div className="w-full max-w-md p-6 mx-auto bg-card rounded-lg shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-primary">ExpenseTracker</h1>
            <p className="text-muted-foreground">Manage your finances with ease</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
