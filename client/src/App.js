import { Route, Routes } from "react-router-dom"
import DesktopNavbar from "./components/DesktopNavbar"
import Home from './pages/Home';
import Product from './pages/Product';
import Products from './pages/Products';
import Reviews from "./pages/Reviews";

function App() {
  return (
    <>
      <DesktopNavbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/products" element={<Products/>}/>
        <Route path="/products/:id" element={<Product/>}/>
        <Route path="/products/:id/reviews" element={<Reviews/>}/>
      </Routes>
    </>

  );
}

export default App;
