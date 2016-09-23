var request = require('request');
var baseUrl = 'https://preview.twilio.com/Sync/Services/'
var accountSid = 'ISe0951d01c9e73151167b09171d04285f'
var url = `${baseUrl}${accountSid}/Maps/`;
var header = {'Authorization':'Basic QUNhOTMxMmRlZTI2ODkxODhjMDI1YzZkN2M2MWI3MDAxYzo0M2IxNzUwZDFmZWZlYjVmODVmMWFmYzU2YzkxYTNjMg=='}

var addItem = function(userId,createObj) {
return new Promise((resolve,reject) => {
		request({
			url:`${baseUrl}${accountSid}/Maps/${userId}/Items`,
			method:'POST',
			form: {
				Key:'images',
				Data:JSON.stringify(createObj)
			},
			headers:header
		},(err,body,r) => {
			if(JSON.parse(r).status === 409) {
				console.log('this')
				reject(createObj)
			} else {
				console.log('that')
				resolve(createObj)
			}
		})
	})
}
var updateMap = function(userId,updateObj) {
	return new Promise((resolve,reject) => {
		console.log(userId,updateObj)
		request({
			url:`${baseUrl}${accountSid}/Maps/${userId}/Items/images`,
			method:'POST',
			form: {
				Data:JSON.stringify(updateObj)
			},
			headers:header
		},(err,body,r) => {
			if(JSON.parse(r).status === 409) {
				reject()
			} else {
				resolve()
			}
		})
	})
}
var createMap = function(userId) {
	return new Promise((resolve,reject) => {
		request({
			url:`${baseUrl}${accountSid}/Maps`,
			method:'POST',
			form: {
				UniqueName:userId
			},
			headers:header
		},(err,body,r) => {
			return resolve(userId)
		})
	})
}
var userId='newTESTER'
createMap(userId)
	.then((x) => { return addItem(x,{headshot:'thisUrlChvewange',chat:'blah'})})
	.then((x) => Promise.resolve())
	.catch((e) => { return updateMap(userId,e)})
	.then((y) => console.log('Worked'))
	.catch((err) => console.log(err))

