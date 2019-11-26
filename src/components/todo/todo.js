import React, { Component } from 'react';
import './todo.scss';
import firebase from '../../fbConfig';

export default class Todo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            todoText:'',
            todos: [],
            loading:false,
        }
    }

    handleKeyPress = async (evt) => {
        if (evt.key === 'Enter' && this.state.todoText.trim().length > 0) {
            this.setState({
                loading:true,
            });
            let todos = this.state.todos;
            let todoObj = { todoDesc: this.state.todoText.trim(), completed: false };
            todos.push(todoObj);
            this.setState({
                todos,
                todoText:''
            });
            await firebase.firestore().collection('todos').add(todoObj);
            this.setState({
                loading: false,
            });
        }
    }

    componentDidMount(){
        this.setState({
            loading:true
        });
        this.unsubscribe = firebase.firestore().collection('todos').orderBy('completed').onSnapshot((snapshot) => {
            let db = snapshot.docs;
            let todo = [];
            db.forEach((value,index) => {
                todo.push({...value.data(),uid:value.id});
            });
            this.setState({
                todos: todo,
                loading: false
            });
        });
    }

    componentWillUnmount(){
        this.unsubscribe();
    }

    toggleToDo = async (todoid,evt) =>{
        let todos = this.state.todos;
        todos[todoid].completed = !todos[todoid].completed;
        this.setState({
            todos,
            loading:true
        });
        const documentSnapshot = await firebase.firestore().collection('todos').doc(todos[todoid].uid).set(todos[todoid]);
        this.setState({
            loading:false
        });

    }

    render() {
        var dt = new Date();
        return (
            <section>
                <header>
                    <div className="date">
                        <div className="day">{dt.getDate()}</div>
                        <span>
                            <p className="month">{dt.toLocaleString('en-us', { month: "short" }).toUpperCase()}</p>
                            <p className="year">{dt.getFullYear()}</p>
                        </span>
                    </div>
                    <div className="dayinword">{dt.toLocaleString('en-us', { weekday: 'long' }).toUpperCase()}</div>
                </header>
                <div className="add-new">
                    {this.state.loading && <div className="loader"></div>}
                    <input type="text" onKeyPress={this.handleKeyPress} onChange={(todoText) => this.setState({todoText:todoText.target.value})} value={this.state.todoText} placeholder="Add New Task...[Press Enter]" />
                </div>
                <div className={"listbox"}>
                    {
                        this.state.todos.map(function (todo, index) {
                            return (
                                <div key={index} id={"todo" + index} className={"todo clearfix " + (todo.completed ? "done" : "")}>
                                    <input className="status" onChange={(e) => this.toggleToDo(index,e)} id={index} checked={todo.completed ? "checked" : ""} type="checkbox" />
                                    <label htmlFor={index}><span className={todo.completed ? "strikethrough" : ""}>{todo.todoDesc}</span></label>
                                </div>
                            );
                        }, this)
                    }
                </div>
            </section>
        );
    }
}
