import React from "react"
import Navbar from "../components/Navbar"
import axios from "axios"
import { base_url, encrypt, decrypt } from "../config"
import Modal from "../components/Modal"
import $ from "jquery"
import ApexCharts from "apexcharts";

export default class Exam extends React.Component{
    constructor(){
        super()
        this.state = {
            token: "",
            exams: [],
            startExam: {
                token: "",
                exam_id: "",
                exam_name: ""
            },
            scores: [],
            member: {
                action: "",
                member_id: "",
                member_name: "",
                email: "",
                username: "",
                team_id: "",
                changePassword: false,
                password: ""
            },
        }

        if (localStorage.getItem("scrt_code")) {
            this.state.token = localStorage.getItem("scrt_code")
        } else {
            window.location = "/login"
        }
    }

    headerConfig = () => {
        let header = {
            headers: { Authorization: `Bearer ${this.state.token}` }
        }
        return header
    }

    infoCountExams = count => {
        if (count === 0) {
            return (
                <i className="text-warning">List of exams is empty.</i>
            )
        }else{
            return null
        }
    }

    getExams = () => {
        let url = base_url + "/exam-list"
        axios.get(url, this.headerConfig())
        .then(response => {
            if (response.data.error) {
                window.alert(response.data.error)
                window.location = "/login"                
            } else {
                this.setState({exams: response.data})    
            }
            
        })
        .catch(e => console.log(e.message))
    }

    initMember = () => {
        let member = JSON.parse(localStorage.getItem("member"))
        this.setState({
            member: {
                action: "update",
                member_id: member.member_id,
                member_name: member.member_name,
                email: member.email,
                username: member.username,
                team_id: member.team_id,
                changePassword: false,
            }
        })
    }

    saveMember = (event) => {
        event.preventDefault()
        $("#member_modal").modal('hide')
        let url = base_url + "/member-save"
        let form = new FormData()
        form.append("action", this.state.member.action)
        form.append("member_id", this.state.member.member_id)
        form.append("member_name", this.state.member.member_name)
        form.append("team_id", this.state.member.team_id)
        form.append("email", this.state.member.email)
        form.append("username", this.state.member.username)

        if(this.state.member.changePassword === true){
           form.append("password", this.state.member.password)
        }

        axios.post(url, form, this.headerConfig())
        .then(response => {
            let status = response.data.status
            if (status) {
                window.alert(response.data.message)
                this.getMember()
            } else {
                window.alert(response.data.message)
            }
        })
        .catch(e => console.log(e.message))
    }

    getMember = () => {
        let url = base_url + "/member"
        axios.get(url, this.headerConfig())
        .then(response => {
            if (response.data.error) {
                window.alert(response.data.error)
                window.location = "/login"                
            } else {
                let member = response.data.find(it => it.member_id === this.state.member.member_id)
                localStorage.setItem("member", JSON.stringify(member))
            }
            
        })
        .catch(e => console.log(e.message))
    }

    setPassword = () => {
        if (this.state.member.action === "update" && this.state.member.changePassword === false) {
            return (
                <button className="mb-1 btn btn-block btn-dark"
                onClick={() => this.setState({member:{ ...this.state.member, changePassword:true}})}>
                    <span className="fa fa-key"></span> Change Password
                </button>
            )
        } else {
            return (
                <div>
                    Password
                    <input type="password" className="form-control mb-1" required
                    value={this.state.member.password}
                    onChange={e => this.setState({member:{ ...this.state.member,password:e.target.value}})}
                    />
                </div>
            )
        }
    }

    componentDidMount(){
        this.getExams()
        this.initMember()
    }

    statusComponent = (status) => {
        if (status) {
            return (
                <h6>
                    <span className="badge badge-success">Active</span>
                </h6>
            )
        } else {
            return (
                <h6>
                    <span className="badge badge-danger">Inactive</span>
                </h6>
            )
        }
    }

    enterToken = ex => {
        $("#token_modal").modal("show")
        this.setState({
            startExam: {
                exam_id: ex.exam_id,
                exam_name: ex.exam_name,
                token: ""
            }
        })
    }

    sendToken = ev => {
        ev.preventDefault()
        let member = JSON.parse(localStorage.getItem("member"))
        let url = base_url + "/sendToken"
        let form = new FormData()
        form.append("exam_id", this.state.startExam.exam_id)
        form.append("token", this.state.startExam.token)
        form.append("team_id", member.team_id)

        axios.post(url, form, this.headerConfig())
        .then(response => {
            let status = response.data.status
            if (status) {
                $("#token_modal").modal("hide")
                let enExamID = encrypt(this.state.startExam.exam_id)
                let doExamID = encrypt(response.data.do_exam_id)
                localStorage.setItem("eID", enExamID)
                localStorage.setItem("doEID", doExamID)
                window.location = "/test"
            } else {
                window.alert(response.data.message)
            }
        })
        .catch(e => console.log(e.message))
    }

    permission = (exam, exam_details) => {
        //  get team_id
        let member = JSON.parse(localStorage.getItem("member"))
        let team_id = member.team_id
        let exists = exam_details.find(it => it.team_id === team_id && it.exam_id === exam.exam_id)
        if (!exists) {
            return true // not done
        } else {
            if(exists.status === 1){
                return false // already done
            }else{
                return null // on going
            }
        }
    }

    permissionComponent = value => {
        if (value === null) {
            return (
                <h6>
                    <span className="badge badge-success">On Going</span>
                </h6>
            )
        } else if (value === true) {
            return (
                <h6>
                    <span className="badge badge-secondary">Not Done</span>
                </h6>
            )
        } else if (value === false) {
            return (
                <h6>
                    <span className="badge badge-primary">Already Done</span>
                </h6>
            )
        }
    }

    getResult = ex => {
        $("#score_modal").modal("show")
        let url = base_url + "/get-score/" + ex.exam_id
        axios.get(url, this.headerConfig())
        .then(response => {
            if (response.data.error) {
                window.alert(response.data.error)
                window.location = "/login"                
            } else {
                this.setState({
                    // scores: response.data,
                    startExam: {...this.state.startExam, exam_name: ex.exam_name}
                })    
                let data = response.data
                let yData = []
                let xData = []
                let total = 0
                if(data.length > 0){
                    data[0].exam_details.map(d => {
                        xData.push(d.team.team_name)
                        total = 0
                        d.exam_details.map(c => {
                            total += c.score
                        })
                        yData.push(total)
                    })
                }
                var options = {
                    chart: {
                        type: 'bar',
                        height:200
                    },
                    series: [{
                        name: 'score',
                        data: yData
                    }],
                    plotOptions:{
                        bar: {
                            horizontal:true
                        }
                    },
                    dataLabels: {
                        enabled: false
                    },
                    xaxis: {
                        categories: xData
                    }
                }
                document.querySelector("#lineChart").innerHTML = ""
                var chart = new ApexCharts(document.querySelector("#lineChart"), options);
                
                chart.render();
            }
            
        })
        .catch(e => console.log(e.message))
    }

    render(){
        return (
            <div>
                <Navbar />
                <div className="container">
                    <div className="card my-2">
                        <div className="card-header bg-info">
                            <h5 className="text-white">
                                <span className="fa fa-user"></span> Profile
                                <button className="btn btn-sm btn-dark mx-2"
                                data-toggle="modal" data-target="#member_modal">
                                    <span className="fa fa-edit"></span>
                                </button>
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="mt-1 col-lg-2 col-md-3 col-sm-6">
                                    Name
                                </div>
                                <div className="mt-1 col-lg-10 col-md-9 col-sm-6">
                                    : {this.state.member.member_name}
                                </div>

                                <div className="mt-1 col-lg-2 col-md-3 col-sm-6">
                                    Email
                                </div>
                                <div className="mt-1 col-lg-10 col-md-9 col-sm-6">
                                    : {this.state.member.email}
                                </div>

                                <div className="mt-1 col-lg-2 col-md-3 col-sm-6">
                                    Username
                                </div>
                                <div className="mt-1 col-lg-10 col-md-9 col-sm-6">
                                    : {this.state.member.username}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card my-2">
                        <div className="card-header bg-light">
                            <h5>
                                <span className="fa fa-file"></span> List of Exam
                            </h5>
                        </div>
                        <div className="card-body">
                            {this.infoCountExams(this.state.exams)}
                            {this.state.exams.map(ex => (
                                <div key={ex.exam_id} className="card">
                                    <div className="card-header">
                                        <div className="row">
                                            <div className="col-lg-4 col-md-6 col-sm-12">
                                                <small className="text-danger">Exam Name</small>
                                                <h6>{ex.exam_name}</h6>
                                            </div>
                                            <div className="col-lg-2 col-md-4 col-sm-6">
                                                <small className="text-danger">Exam Status</small>
                                                {this.statusComponent(ex.status)}
                                                {this.permissionComponent(this.permission(ex, ex.exam_details))}
                                            </div>
                                            <div className="col-lg-4 col-md-6 col-sm-12">
                                                <small className="text-danger">Action</small> <br />
                                                <button className="btn btn-sm btn-primary"
                                                onClick={() => this.enterToken(ex)}
                                                disabled={ex.status && (this.permission(ex, ex.exam_details) === null ? true : this.permission(ex, ex.exam_details)) ? false : true}>
                                                    <span className="far fa-play-circle"></span> Start Exam
                                                </button>
                                                <button className="btn btn-sm btn-success mx-2"
                                                onClick={() => this.getResult(ex)}>
                                                    <span className="fas fa-chart-line"></span> Result
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* token modal */}
                <Modal id="token_modal" title="Exam Validation"
                colorHeader="white" bgHeader="info" size="sm">
                    <form onSubmit={ev => this.sendToken(ev)}>
                        Enter token of {this.state.startExam.exam_name}
                        <input type="text" className="form-control mb-1" required
                        value={this.state.startExam.token}
                        onChange={e => this.setState({startExam: {...this.state.startExam, token:e.target.value}})}
                        />

                        <button type="submit" className="btn btn-info btn-sm btn-block">
                            Save
                        </button>
                    </form>
                </Modal>

                {/* score modal */}
                <Modal id="score_modal" title="Scoring Board"
                colorHeader="white" bgHeader="info" size="lg">
                    <h5 className="mx-2">
                        Scoring Board of {this.state.startExam.exam_name}
                        {/* <LineChart dataSource={this.state.scores} /> */}
                        <div id="lineChart"></div>
                    </h5>
                </Modal>

                {/* member modal */}
                <Modal id="member_modal" title="Member Form"
                colorHeader="white" bgHeader="success" size="md">
                    
                    <form onSubmit={ev => this.saveMember(ev)}>
                        Member Name
                        <input type="text" className="form-control mb-1" required
                        value={this.state.member.member_name}
                        onChange={e => this.setState({member:{ ...this.state.member,member_name:e.target.value}})}
                        />
                        
                        Email
                        <input type="text" className="form-control mb-1" required
                        value={this.state.member.email}
                        onChange={e => this.setState({member:{ ...this.state.member,email:e.target.value}})}
                        />

                        Username
                        <input type="text" className="form-control mb-1" required
                        value={this.state.member.username}
                        onChange={e => this.setState({member:{ ...this.state.member,username:e.target.value}})}
                        />

                        {this.setPassword()}

                        <button type="submit" className="btn btn-block btn-sm btn-success">
                            Save
                        </button>
                    </form>
                </Modal>

            </div>
        )
    }
}