import React from "react"
import {Link} from "react-router-dom"
import logo from "../assets/logo.png"

class Navbar extends React.Component{
    Logout = () => {
        localStorage.removeItem("scrt_code")
        localStorage.removeItem("member")
        localStorage.removeItem("eID")
        localStorage.removeItem("doEID")
        // window.location = "/login"
    }
    render(){
        let member = JSON.parse(localStorage.getItem('member'))
        return(
            <div className="navbar navbar-expand-lg navbar-light"
            style={{background:"#00a8a8"}}>
                <a className="navbar-brand">
                    <img src={logo} width="60" className="img mr-2" alt="LKS SMK" />
                    <strong className="text-white">LKS SMK KOTA MALANG</strong>
                    {/* <br /><small><i><strong>Cyber Security</strong></i></small> */}
                </a>
                

                {/* show and hide menu */}
                <button className="navbar-toggler" data-toggle="collapse"
                data-target="#menu">
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* menu */}
                
                <div id="menu" className="navbar-collapse collpase">
                    <ul className="navbar-nav ml-auto">
                        <li className="nav-item">
                            <div className="text-bold text-white">
                            {member.member_name}
                            <Link className="mx-2 text-warning" to="/login" onClick={() => this.Logout()}>
                                {/* <span className="fa fa-sign-out-alt"></span> */}
                                <small> <strong>[Logout]</strong> </small>
                            </Link>
                            
                            <br />
                            {member.team.team_name} | {member.team.school.school_name} <br />
                            {/* <Link className="nav-link" to="/login" onClick={() => this.Logout()}>
                                Logout
                            </Link> */}
                            </div>
                        </li>
                        
                    </ul>
                </div>
            </div>
        )
    }
}
export default Navbar;