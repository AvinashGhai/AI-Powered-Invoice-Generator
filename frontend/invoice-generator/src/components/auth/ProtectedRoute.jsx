import {Navigate, Outlet} from 'react-router-dom'
import Dashboard from '../../pages/Dashboard/Dashboard';
import DashBoardLayout from '../layout/DashBoardLayout';

const ProtectedRoute = ({children}) => {
  const isAuthenticated= true;
  const loading = false;

  if(loading){
    // you can render a loading spinner here
    return <div>Loading...</div>
  }

  if(!isAuthenticated){
    return <Navigate to="/login" replace />
  }

  return(
    <DashBoardLayout>{children? children : <Outlet/>}</DashBoardLayout>
  )


}

export default ProtectedRoute