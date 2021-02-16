import React from "react"
import { base_url, storage_url, encrypt, decrypt } from "../config"
import Navbar from "../components/Navbar"
import axios from "axios"
import TestList from "../components/TestList"
import Modal from "../components/Modal"
import $ from "jquery"
import Alert from "../components/Alert"
import { useEffect } from "react";

export default class Test extends React.Component{
    constructor(){
        super()
        this.state = {
            token: "",
            categories: [],
            do_exam_id: "",
            results: [],
            permission: true,
            submit: {
                question_id: "",
                question: "",
                answer: "",
                files: [],
                point: 0,
                result: null,
            }
        }

        if (localStorage.getItem("scrt_code") && localStorage.getItem("doEID")) {
            this.state.token = localStorage.getItem("scrt_code")
            this.state.do_exam_id = decrypt(localStorage.getItem("doEID"))
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

    getResult = () => {
        let url = base_url + "/get-result"
        let form = new FormData();
        let do_exam_id = decrypt(localStorage.getItem("doEID"))
        form.append("do_exam_id", do_exam_id)
        axios.post(url, form, this.headerConfig())
        .then(response => {
            if (response.data.error) {
                window.alert(response.data.error)
                window.location = "/login"                
            } else {
                
                let results = response.data.results
                let categories = this.state.categories
                for (let index = 0; index < categories.length; index++) {
                    for (let indeks = 0; indeks < categories[index].category.questions.length; indeks++) {
                        let i = results.findIndex(it => it.question_id === categories[index].category.questions[indeks].question_id)
                        if (i < 0) {
                            categories[index].category.questions[indeks].validate = null
                            categories[index].category.questions[indeks].answer = ""
                        } else {
                            if(results[i].score > 0){
                                categories[index].category.questions[indeks].validate = true
                                categories[index].category.questions[indeks].answer = results[i].answer
                            } else {
                                categories[index].category.questions[indeks].validate = false
                                categories[index].category.questions[indeks].answer = results[i].answer
                            }
                        }
                    }
                }

                this.setState({
                    categories: categories,
                    results: results,
                    permission: response.data.exam.status
                })
            }
            
        })
        .catch(e => console.log(e.message))
    }

    getExamCategory = () => {
        let url = base_url + "/get-question"
        let form = new FormData();
        let examID = decrypt(localStorage.getItem("eID"))
        form.append("exam_id", examID)
        axios.post(url, form, this.headerConfig())
        .then(response => {
            if (response.data.error) {
                window.alert(response.data.error)
                window.location = "/login"                
            } else {
                this.setState({categories: response.data})
                this.getResult()
                setInterval(() => {this.getResult()}, 11000)
            }
            
        })
        .catch(e => console.log(e.message))
    }

    componentDidMount(){
        this.getExamCategory()
    }

    openQuestion = question => {
        $("#question_modal").modal("show")
        this.setState({
            submit: {
                question_id: question.question_id,
                question: question.question,
                answer: question.answer,
                files: question.files,
                point: question.point,
                result: null
            }
        })
    }

    submitAnswer = ev => {
        ev.preventDefault()
        // $("#question_modal").modal("hide")
        let member = JSON.parse(localStorage.getItem("member"))
        let form = new FormData()
        form.append("do_exam_id",this.state.do_exam_id)
        form.append("member_id",member.member_id)
        form.append("question_id", this.state.submit.question_id)
        form.append("answer", this.state.submit.answer)
        let url = base_url + "/submit-answer"

        axios.post(url, form, this.headerConfig())
        .then(response => {
            let status = response.data.status
            if (status) {
                // window.alert(response.data.message)
                this.setState({submit:{...this.state.submit, result: response.data.result}})
                this.getResult()
            } else {
                window.alert(response.data.message)
            }
        })
        .catch(e => console.log(e.message))
    }

    alertTrueFalse = validate => {
        if (validate === null) {
            return null
        } else if (validate === true) {
            return (
                <Alert bgColor="green" show={true}>
                    <strong><i>Your answer is correct</i></strong>
                </Alert>
            )
        } else if (validate === false){
            return (
                <Alert bgColor="maroon" show={true}>
                    <strong><i>Your answer is incorrect</i></strong>
                </Alert>
            )
        }
    }    

    finish = () => {
        if (window.confirm("Are you sure will finish this exam?")) {
            let url = base_url + "/finish-exam"
            let do_exam_id = decrypt(localStorage.getItem("doEID"))
            let form = new FormData()
            form.append("do_exam_id", do_exam_id)
            axios.post(url, form, this.headerConfig())
            .then(response => {
                let status = response.data.status
                if (status) {
                    window.alert(response.data.message)
                    localStorage.removeItem("doEID")
                    localStorage.removeItem("eID")
                    window.location = "/exam"
                } else {
                    window.alert(response.data.message)
                }
            })
            .catch(e => console.log(e.message))
        }
    }

    render(){
        return (
            <div>
                <Navbar />
                <div className="container">
                    <div className="card my-2">
                        <div className="card-header bg-light">
                            <h5>
                                <span className="fas fa-file-signature"></span> Questions
                            </h5>
                        </div>
                        <div className="card-body">
                            {this.state.categories.map(cat => (
                                <TestList
                                key={cat.category_id}
                                category_id={cat.category_id}
                                category_name={cat.category.category_name}
                                questions={cat.category.questions}
                                openQuestion={q => this.openQuestion(q)}
                                permission={this.state.permission}
                                 />
                            ))}    
                            <div className="text-right">
                                <button className="btn btn-info my-2" onClick={() => this.finish()}>
                                    <span className="fa fa-check"></span> Finish Exam
                                </button> 
                            </div>
                                                   
                        </div>
                    </div>
                </div>

                {/* question modal */}
                <Modal id="question_modal" title="Question"
                colorHeader="white" bgHeader="primary" size="lg">
                    <form onSubmit={ev => this.submitAnswer(ev)}>
                        <h5>
                            <span className="badge badge-info">Point: {this.state.submit.point}</span>
                        </h5>
                        <div dangerouslySetInnerHTML={{__html: this.state.submit.question}}>
                        </div>
                        <div className="row mx-1">
                        {this.state.submit.files.map(file => (
                            <div key={file.file_id} className="col-lg-6 col-sm-12 p-1">
                                <a href={storage_url+file.file_name} download target="_blank">
                                    {file.file_name}
                                </a>
                            </div>
                        ))}
                        </div>
                        <div className="row my-2">
                            <div className="col-lg-9 col-sm-12">
                                <small className="text-danger">
                                    Format Flag: LKSMALANG29{`{.....}`}
                                </small>
                                <input type="text" required className="form-control"
                                value={this.state.submit.answer}
                                onChange={e => this.setState({submit:{...this.state.submit,answer: e.target.value}})}
                                />
                            </div>
                            <div className="col-lg-3 col-sm-12">
                                <br />
                                <button type="submit" className="btn btn-primary">
                                    Submit
                                </button>
                            </div>
                        </div>
                        {this.alertTrueFalse(this.state.submit.result)}
                    </form>
                </Modal>
            </div>
        )
    }
}