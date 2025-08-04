import { Input } from "../components/ui/input";

const LoginPage = () => {
  return (
    <div className="my-background h-screen w-screen flex justify-center items-center">
      <div className="flex flex-col">
        <h1 className="text-3xl font-semibold flex justify-center items-center ">
          My Chat App
        </h1>
        <h2 className="text-2xl font-semibold">Login in your account</h2>
        <div>
          <label htmlFor="email" className="text-xl font-medium">
            Email
          </label>
          <Input />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
