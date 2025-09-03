import{Routes, Route} from 'react-router-dom'
import './App.css'
import Nav from './Compoent/Visitors/Nav/nav.tsx'
import Home from './Compoent/Visitors/Home/home'
import Register from './Compoent/Visitors/Register/regsiter'
import Login from './Compoent/Visitors/Login/login'
import Logout from './Compoent/Visitors/Logout/Logout'
import ProductList from './Compoent/Visitors/Product/product'
import ManagerHome from './Compoent/Manager/Home/Home'


function App() {


  return (
    <>
    <Nav/>

    <Routes>
      <Route path='/' element={<Home/>}></Route>
       <Route path='/register' element={<Register/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/logout' element={<Logout/>}></Route>
          <Route path='/products' element={<ProductList/>}></Route>

           {/* <Route path='/branch-dashboard' element={<ManagerHome/>}></Route> */}
    </Routes>


    </>
  )
}

export default App;
