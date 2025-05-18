import {Header} from "./Header";
import {Footer} from "./Footer";


interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({children}: MainLayoutProps) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
    <Header />
      <main style={{ flexGrow: 1 }}>{children}</main>
      <Footer />
    </div>
  );
};
