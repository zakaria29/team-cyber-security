import React from "react"
import Navbar from "../components/Navbar"
import axios from "axios"
import { base_url, encrypt, decrypt } from "../config"
import Modal from "../components/Modal"
import $ from "jquery"

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
            }
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

    componentDidMount(){
        this.getExams()
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

    render(){
        return (
            <div>
                <Navbar />
                <div className="container">
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
                                            </div>
                                            <div className="col-lg-2 col-md-4 col-sm-6">
                                                <small className="text-danger">Action</small> <br />
                                                <button className="btn btn-sm btn-primary"
                                                onClick={() => this.enterToken(ex)}
                                                disabled={ex.status ? false : true}>
                                                    <span className="far fa-play-circle"></span> Start Exam
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
            </div>
        )
    }
}