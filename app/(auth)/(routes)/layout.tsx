type Props = {
  children: React.ReactNode;
};
function AuthLayout({children}: Props) {
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      {children}
    </div>
  );
}

export default AuthLayout;
