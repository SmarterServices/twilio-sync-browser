import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'whatwg-fetch';

class App extends Component {
  constructor() {
    super()
    this.state = {
      items:[],
      showDetails:false,
      details:[]
    }
    this.logOut = this.logOut.bind(this)
    this.onSub = this.onSub.bind(this)
    this.deleteMap = this.deleteMap.bind(this)
    this.deleteAll = this.deleteAll.bind(this)
    this.onUserChange = this.onUserChange.bind(this)
    this.onPassChange = this.onPassChange.bind(this)
    this.onServiceChange = this.onServiceChange.bind(this)
  }

  onUserChange(event) {
    this.setState({username:event.target.value})
  }

  onPassChange(event) {
    this.setState({password:event.target.value})
  }

  onServiceChange(event) {
    this.setState({serviceId:event.target.value})
  }

  onSub() {
    const hash = new Buffer(`${this.state.username}:${this.state.password}`).toString('base64')
    this.setState({token:hash})
    fetch(`https://preview.twilio.com/Sync/Services/${this.state.serviceId}/Maps`,{
      headers: {
        'Authorization':`Basic ${hash}`
      }
    })
    .then(function(response) {

      return response.text()

    }).then(function(body) {

      this.setState({'items':JSON.parse(body).maps})

    }.bind(this))
  }

  deleteMap(url) {

   fetch(url,{
    method:'DELETE',
    headers: {
      'Authorization':`Basic ${this.state.token}`
    }
  }) 
   .then(function(res) {

    this.onSub()

  }.bind(this))

 }
  deleteAll(urlArr) {
    urlArr.forEach(x => {
      this.deleteMap(x)
    })
 }

 logOut(url) {

  fetch(url,{
    headers: {
      'Authorization':`Basic ${this.state.token}`
    }
  })
  .then(function(response) {

    return response.text()

  }).then(function(body) {

    var newObj = JSON.parse(body);

    var newMap = newObj.items.map(x => {

      var newObj = {

      }
      newObj[x.key] = JSON.stringify(x.data)    
      return newObj 
    }) 
    this.setState({'details':newMap})
  }.bind(this))  }

  render() {
    var items = this.state.items
    var details = this.state.details;
    var arr = details.map((x) => {
      for(var i in x) {
        return(<p>{i}:{x[i] ? x[i].toString() : 'False'}</p>)
      }
    })

    if(arr.length === 0) {

      arr = <p>No items in this map</p>

    }
let urlMap = items.map(x => {
    return `https://preview.twilio.com/Sync/Services/${this.state.serviceId}/Maps/${x.unique_name}`
});
let deleteAllButton = <button style={{color:'red'}} onClick={this.deleteAll.bind(this,urlMap)}>delete all</button>
    var pMap = items.map(x => {
      return (
        <tr>
          <td>{x.created_by}</td>
          <td>{x.date_created}</td>
          <td>{x.date_updated}</td>
          <td><p style={{color:'blue',cursor:'pointer'}} onClick={this.logOut.bind(this,x.links.items)}>links:{x.links.items}</p></td>
          <td>{x.revision}</td>
          <td>{x.unique_name}</td>
          <td>{x.url}</td>
          <td><button style={{color:'red'}} onClick={this.deleteMap.bind(this,`https://preview.twilio.com/Sync/Services/${this.state.serviceId}/Maps/${x.unique_name}`)}>delete</button></td>
        </tr>
        )})

    return (
      <div>
        username:<input type="text" onChange={this.onUserChange}></input>
        password:<input type="text" onChange={this.onPassChange}></input>
        serviceid:<input type="text" onChange={this.onServiceChange}></input>
        <button onClick={this.onSub}>Add Credentials</button>
        {deleteAllButton}
      <div style={{height:'700px',width:'100%',float:'left',overflow:'scroll'}}>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>created by</th>
              <th>date created</th>
              <th>date updated</th>
              <th>item link</th>
              <th>revision</th>
              <th>unique name</th>
              <th>url</th>
              <th>delete</th>
            </tr>
          </thead>
          <tbody>
          {pMap}
          </tbody>
        </table>
      </div>
      <h1>Details</h1>
      <div style={{marginTop:'20px',width:'100%',overflow:'scroll'}}>
        {arr}
      </div>
      
      </div>
      );
  }
}

export default App;
