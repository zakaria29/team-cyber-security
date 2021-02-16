import React from "react"
import { Route, Switch } from "react-router-dom";

import Login from "./pages/Login"
import Exam from "./pages/Exam"
import Test from "./pages/Test"

export default class App extends React.Component{
    render(){
        return(
            <Switch>
                <Route path="/" exact component={Exam} /> 
                <Route path="/login" exact component={Login} />
                <Route path="/exam" exact component={Exam} />
                <Route path="/test" exact component={Test} />
            </Switch>
        )
    }
}