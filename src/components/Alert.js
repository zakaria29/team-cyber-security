import React from "react"

export default class Alert extends React.Component{
    render(){
        let bgColor = this.props.bgColor
        let textColor = this.props.textColor
        let show = (this.props.show === true) ? "block" : "none"
        return (
            <div className="alert alert dismissible"
            style={{background: bgColor, color:'white', display:show}}>
                {this.props.children}
            </div>
        );
    }
}