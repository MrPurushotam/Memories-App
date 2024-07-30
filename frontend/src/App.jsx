
import {BrowserRouter as Router , Route , Routes} from "react-router-dom"

import SigninPage from "./components/SigninPage"
import Home from "./components/Home"
import Dashboard from "./components/Dashboard"
import { SecureDashboardRoute, SecureLogin } from "./components/ProtectedRoute"

function App() {

  return(
    <>
    
    <Router>
      <Routes>
        <Route element={<Home/>} to={'/'} index />
        <Route element={<SecureLogin/>}>
            <Route path='/login' element={<SigninPage/>} />
          </Route>
          <Route element={<SecureDashboardRoute/>}>
            <Route path='/dashboard' element={<Dashboard/>} />
          </Route>
      </Routes>
    </Router>
    </>
  )
}

export default App
