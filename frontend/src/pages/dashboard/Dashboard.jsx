import { useAuth } from "../../context/AuthContext"

const Dashboard = () => { 
    const { user } = useAuth(); 
    return ( <div> <h1>{user.name} cu role {user.role} si token {user.token}</h1> </div> ); }

export default Dashboard;