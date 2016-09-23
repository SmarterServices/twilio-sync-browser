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
    this.onTokenChange = this.onTokenChange.bind(this)
    this.onServiceChange = this.onServiceChange.bind(this)
  }
  componentDidMount() {

  }
  onTokenChange(event) {
    this.setState({token:event.target.value})
  }
  onServiceChange(event) {
    this.setState({serviceId:event.target.value})
  }
  onSub() {
    fetch(`https://preview.twilio.com/Sync/Services/${this.state.serviceId}/Maps`,{
      headers: {
        'Authorization':`Basic ${this.state.token}`
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
    var blah = this.state.items
    var details = this.state.details;
    var arr = details.map((x) => {
      for(var i in x) {
        return(<p>{i}:{x[i] ? x[i].toString() : 'False'}</p>)
      }
    })
    var pMap = blah.map(x => {
      return (
        <div>
        <p>accountId:{x.account_sid}</p>
        <p>created_by:{x.created_by}</p>
        <p>date_created:{x.date_created}</p>
        <p>date_updated:{x.date_updated}</p>
        <p style={{color:'blue',cursor:'pointer'}} onClick={this.logOut.bind(this,x.links.items)}>links:{x.links.items}</p>
        <p>revision:{x.revision}</p>
        <p>service_sid:{x.service_sid}</p>
        <p>unique_name:{x.unique_name}</p>
        <p>url:{x.url}</p>
        <button style={{color:'red'}} onClick={this.deleteMap.bind(this,`https://preview.twilio.com/Sync/Services/${this.state.serviceId}/Maps/${x.unique_name}`)}>delete</button>
        <hr/>
        <hr/>
        </div>
        )
    })
    return (
      <div>
      Token:<input type="text" onChange={this.onTokenChange}></input>
      ServiceId:<input type="text" onChange={this.onServiceChange}></input>
      <button onClick={this.onSub}>Add Credentials</button>
      <div style={{borderStyle:'solid',height:'700px',float:'left',width:'45%',overflow:'scroll'}}>
      {pMap}
      </div>
      <div style={{float:'right',borderStyle:'solid',width:'45%',overflow:'scroll'}}>
      {arr}
      </div>
      </div>
      );
  }
}

export default App;
