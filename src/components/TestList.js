import React from "react"

export default class TestList extends React.Component{
    cardPoint = (que) => {
        if (que.validate === null) {
            return (
                <button className="btn btn-block ml-1 mt-1"
                onClick={() => this.props.openQuestion(que)}>
                    <div className="card">
                        <div className="card-body bg-light">
                            <h6 className="text-center">{que.point}</h6>
                        </div>
                    </div>
                </button>
            )
        } else if (que.validate === true) {
            return (
                <button className="btn btn-block ml-1 mt-1" disabled>
                    <div className="card">
                        <div className="card-body bg-success">
                            <h6 className="text-center text-white">{que.point}</h6>
                        </div>
                    </div>
                </button>
            )
        } else if (que.validate === false){
            return (
                <button className="btn btn-block ml-1 mt-1"
                onClick={() => this.props.openQuestion(que)}>
                    <div className="card">
                        <div className="card-body bg-danger">
                            <h6 className="text-center text-white">{que.point}</h6>
                        </div>
                    </div>
                </button>
            )
        }
    }
    render(){
        let categoryID = this.props.category_id
        let categoryName = this.props.category_name
        let questionList = this.props.questions
        return (
            <div className="card">
                <div className="card-body">
                    <h6>{categoryName}</h6>
                    <div className="row">
                        {questionList.map(que => (
                            <div key={que.question_id} className="col-lg-2 col-md-3 col-sm-4">
                                {this.cardPoint(que)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}