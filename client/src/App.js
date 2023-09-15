import { Route, Routes } from "react-router-dom"
import DesktopNavbar from "./components/DesktopNavbar"
import Home from './pages/Home';
import Product from './pages/Product';
import Products from './pages/Products';

function App() {
  return (
    <>
      <DesktopNavbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/products" element={<Products/>}/>
        <Route path="/products/:id" element={<Product/>}/>
      </Routes>
    </>

  );
}

export default App;
