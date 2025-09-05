import { Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './Compoent/Visitors/Home/home'
import Register from './Compoent/Visitors/Register/regsiter'
import Login from './Compoent/Visitors/Login/login'
import Logout from './Compoent/Visitors/Logout/Logout'
import ProductList from './Compoent/Visitors/Product/product'
import ManagerHome from './Compoent/Manager/Home/Home'
import OrdersDashboard from './Compoent/SuperAdmin/Orders/newOrder.jsx'
import UserDashboard from './Compoent/SuperAdmin/users/users.jsx'
import Navbar from './Compoent/Visitors/Nav/nav.jsx'
import BrandList from './Compoent/SuperAdmin/Brands/Brand.jsx'
import EditBrand from './Compoent/SuperAdmin/Brands/editBrand.jsx'

import { ToastContainer } from "react-toastify";

function App() {


  return (
    <>
      <Navbar />

      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/register' element={<Register />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/logout' element={<Logout />}></Route>
        <Route path='/products' element={<ProductList />}></Route>
        <Route path='/orders' element={<OrdersDashboard />}></Route>
        <Route path='/users' element={<UserDashboard />}></Route>
        <Route path='/brand' element={<BrandList/>}></Route>
        <Route path='/brands/:id' element={<EditBrand />}></Route>
        
        {/* <Route path='/branch-dashboard' element={<ManagerHome/>}></Route> */}
      </Routes>

   <ToastContainer position="top-right" autoClose={2000} />
    </>
  )
}

export default App;
