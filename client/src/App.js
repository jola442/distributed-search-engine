import { Route, Routes } from "react-router-dom"
import DesktopNavbar from "./components/DesktopNavbar"
import Home from './pages/Home';
import Product from './pages/Product';
import Products from './pages/Products';
import Reviews from "./pages/Reviews";
import Pages from "./pages/Pages";
import Page from "./pages/Page";

function App() {
  return (
    <>
      <DesktopNavbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/products" element={<Products/>}/>
        <Route path="/products/:id" element={<Product/>}/>
        <Route path="/products/:id/reviews" element={<Reviews/>}/>
        <Route path="/pages" element={<Pages/>}/>
        <Route path="/fruits" element={<Pages type="fruits"/>}/>
        <Route path="/personal" element={<Pages type="personal"/>}/>
        <Route path="/fruits/:id" element={<Page type="fruits"/>}/>
        <Route path="/personal/:id" element={<Page type="personal"/>}/>
      </Routes>
    </>

  );
}

export default App;
