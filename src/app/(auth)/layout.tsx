interface Props {
    children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen w-full bg-background">
      {children}
    </div>
  );
};

export default Layout;