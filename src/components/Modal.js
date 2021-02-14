import React from "react"

export default class Modal extends React.Component{
    render(){
        let bgHeader = `bg-${this.props.bgHeader}`
        let colorHeader = `text-${this.props.colorHeader}`
        let title = this.props.title
        let id = this.props.id
        let size = this.props.size !== null ? `modal-dialog modal-${this.props.size}` : "modal-dialog"


        return(
            <div className="modal fade" id={id}>
                <div className={size}>
                    <div className="modal-content">
                        <div className={`modal-header ${bgHeader}`}>
                            <h5 className={`modal-title ${colorHeader}`}>
                                {title}
                            </h5>
                            <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                                <span className={colorHeader} aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}