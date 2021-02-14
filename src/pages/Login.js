import React from "react"
import axios from "axios"
import { base_url } from "../config";
import logo from "../assets/logo.png";

import Alert from "../components/Alert"

export default class Login extends React.Component{
    constructor(){
        super()
        this.state = {
            username: "",
            password: "",
            alert: {
                show: "false",
                message: "",
                textColor: "white",
                background: "grey"
            }
        }
    }

    loginProcess = (event) => {
        event.preventDefault()
        let url = base_url + "/member/auth";
        let form = new FormData();
        form.append("username", this.state.username)
        form.append("password", this.state.password)
        axios.post(url, form)
        .then(response => {
            let logged = response.data.logged
            if (logged) {
                this.setState({
                    alert: {
                        show: true,
                        background: "green",
                        message: response.data.message
                    }
                })
                localStorage.setItem("scrt_code", response.data.token)
                localStorage.setItem("member", JSON.stringify(response.data.data))
                window.location = "/"
            } else {
                this.setState({
                    alert: {
                        show:true,
                        background: "maroon",
                        message: response.data.message
                    }
                })
            }
        })
        .catch(e => console.log(e.message))
    }

    render(){
        return (
            <div className="container">
                <div className="col-sm-9 col-md-7 col-lg-5 mx-auto">
                    <div className="card my-5" style={{borderRadius:"10px"}}>
                        <div className="card-header bg-success" 
                        style={{borderTopLeftRadius:"10px", borderTopRightRadius:"10px"}}>
                            <center>
                                <img src={logo} alt="LKS SMK" className="img" width="150" />
                                <h5 className="text-dark text-bold">KOTA MALANG</h5>
                            </center>
                            
                        </div>
                        <div className="card-body">
                            <form onSubmit={ev => this.loginProcess(ev)} className="mb-2">
                                <div className="input-group mb-2">
                                    <span className="input-group-text" id="basic-addon1">Username</span>
                                    <input type="text" className="form-control" 
                                    aria-label="Username" aria-describedby="basic-addon1"
                                    value={this.state.username} required
                                    onChange={ev => this.setState({username: ev.target.value})} />
                                </div>

                                <div className="input-group mb-2">
                                    <span className="input-group-text pr-3" id="basic-addon2">Password </span>
                                    <input type="password" className="form-control" 
                                    aria-label="Password" aria-describedby="basic-addon2"
                                    value={this.state.password} required
                                    onChange={ev => this.setState({password: ev.target.value})} />
                                </div>

                                <button className="btn btn-block btn-success" type="submit">
                                    Sign In
                                </button>
                            </form>
                            <Alert show={this.state.alert.show} bgColor={this.state.alert.background}
                            textColor={this.state.alert.textColor}>
                                <center>{this.state.alert.message}</center>
                            </Alert>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}