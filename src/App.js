import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import 'whatwg-fetch';
import JSONPretty from 'react-json-pretty';

class App extends Component {
  constructor() {
    super()
    this.state = {
      items:[],
      showDetails:false,
      details:[],
      username: localStorage.getItem('username')||'',
      password: localStorage.getItem('password') ||'',
      serviceId: localStorage.getItem('serviceId') || '',
      currentUrl: '',
      key:'key',
      value:'value',
      errorMessage: null
    }
    this.logOut = this.logOut.bind(this)
    this.makeEdit = this.makeEdit.bind(this)
    this.onSub = this.onSub.bind(this)
    this.deleteMap = this.deleteMap.bind(this)
    this.deleteAll = this.deleteAll.bind(this)
    this.onUserChange = this.onUserChange.bind(this)
    this.onKeyChange = this.onKeyChange.bind(this)
    this.onValueChange = this.onValueChange.bind(this)
    this.onPassChange = this.onPassChange.bind(this)
    this.onServiceChange = this.onServiceChange.bind(this)
  }

  onUserChange(event) {
    this.setState({username:event.target.value})
    localStorage.setItem('username',event.target.value)
  }


  onKeyChange(event) {
    this.setState({key:event.target.value})
  }


  onValueChange(event) {
    this.setState({value:event.target.value})
  }

  onPassChange(event) {
    this.setState({password:event.target.value})
    localStorage.setItem('password',event.target.value)
  }

  onServiceChange(event) {
    this.setState({serviceId:event.target.value})
    localStorage.setItem('serviceId',event.target.value)
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

makeEdit() {
  var newUrl = `${this.state.currentUrl}/${this.state.key}`
  console.warn(newUrl)
  var newValue = encodeURIComponent('Data') + '=' + encodeURIComponent(this.state.value) 
  console.log(newValue)
  fetch(newUrl,{
    method:'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization':`Basic ${this.state.token}`
    },
    body: newValue
  })
  .then(x => {
    if(x.status === 400) {
      this.setState({errorMessage:'Value for edit not in json format'})
    }
    else if(x.status === 404) {
      this.setState({errorMessage:'Key does not exist'})
    } 
    else {
      this.setState({errorMessage:null})
      this.logOut(this.state.currentUrl); 
    }
  })
  .catch(e => {
  })
}


logOut(url) {
  this.setState({'currentUrl':url})
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
  }.bind(this))  
  
  }

  render() {
    var shouldShowEdit = '';
    var items = this.state.items
    var details = this.state.details;
    var detailsObject = {};
    var arr = details.map((x) => {
      for(var i in x) {
        if(x[i]) {
          detailsObject[i] = JSON.parse(x[i]);
        }
        return(<p>{i}:{x[i] ? x[i].toString() : 'False'}</p>)
      }
    })

    if(arr.length === 0) {
      arr = <p>No items in this map</p>
      shouldShowEdit = 'none'
    } else {
      arr = <JSONPretty id="json-pretty" json={detailsObject}></JSONPretty>
      shouldShowEdit = 'inline'
    }
    let urlMap = items.map(x => {
      return `https://preview.twilio.com/Sync/Services/${this.state.serviceId}/Maps/${x.sid}`
    });
    var shouldShowButton = (this.state.items.length === 0) ? 'none' : 'inline'
    let deleteAllButton = <button style={{color:'red', display: shouldShowButton}} onClick={this.deleteAll.bind(this,urlMap)}>delete all</button>
    var pMap = items.map(x => {
      return (
        <tr>
          <td>{x.created_by}</td>
          <td>{x.date_created}</td>
          <td>{x.date_updated}</td>
          <td>
            <p style={{color:'blue',cursor:'pointer'}} onClick={this.logOut.bind(this,x.links.items)}>links:{x.links.items.split('/')[7]}</p>
          </td>
          <td>{x.revision}</td>
          <td>{x.unique_name}</td>
          <td><button style={{color:'red'}} onClick={this.deleteMap.bind(this,`https://preview.twilio.com/Sync/Services/${this.state.serviceId}/Maps/${x.sid}`)}>delete</button></td>
        </tr>
      )})

      return (
        <div>
          username:<input type="text" value={this.state.username} onChange={this.onUserChange}></input>
          password:<input type="text" value={this.state.password} onChange={this.onPassChange}></input>
          serviceid:<input type="text" value={this.state.serviceId} onChange={this.onServiceChange}></input>
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
                <th>delete</th>
              </tr>
            </thead>
            <tbody>
              {pMap}
            </tbody>
          </table>
        </div>
          <h1>Details</h1>
          <h4 style={{display:shouldShowEdit}}>Edit Keys</h4><br/>
          <input type="text" value={this.state.key} style={{display:shouldShowEdit}} onChange={this.onKeyChange}></input>
          <input type="text" value={this.state.value} style={{display:shouldShowEdit}} onChange={this.onValueChange}></input>
          <button style={{display:shouldShowEdit}} onClick={this.makeEdit.bind(this)}>edit</button>
          <p style={{color:'red'}}>{this.state.errorMessage}</p>
          <div style={{marginTop:'20px',width:'100%',overflow:'scroll'}}>
            {arr}
          </div>

        </div>
        );
    }
  }

  export default App;
