const axios = require('axios');
const expand = {
  users : '_expand=users',
  rooms : '_expand=rooms',
}
const API = axios.create({
  baseURL: 'http://localhost:3002',
  timeout: 1000,
  headers: { 'Content-Type': 'application/json' }
});

export const fetchMessages = (roomId) => {
  return async dispatch => {
    dispatch({
      type: 'SET_MESSAGES',
      payload: []
    });
    const response = await API.get('/messages/?roomsId=' + roomId +'&'+ expand.users);
    dispatch({
      type: 'SET_MESSAGES',
      payload: response.data
    });
  }
}

export const addMessage = (data) =>{
  return async dispatch => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: data
    });
  }
}

export const fetchRooms = (userId) => {
  return async dispatch => {
    const response = await API.get('/rooms/?usersId='+userId+'&');
    dispatch({
      type: 'SET_ROOMS',
      payload: response.data
    });
    dispatch({
      type: 'SET_CURRENT_ROOM',
      payload: response.data[response.data.length - 1].id
    })
    dispatch(fetchMessages(response.data[response.data.length - 1].id));
  }
}

export const fetchUser = (userId) => {
  return async dispatch => {
    const response = await API.get('/users/' + userId);
    dispatch({
      type: 'SET_USER',
      payload: response.data
    });
  }
}

export const postMessage = (message) => {
  return async dispatch => {
    const response = await API.post('/messages', message);
    // dispatch(fetchMessages(message.roomsId));
  }
}

export const logIn = (data) => {
  return async dispatch => {
    const response = await API.get('/users');
    const users = response.data;
    let isFound = users.find(user => user.email == data.email && user.password == data.password)
    console.log(isFound)
    if (isFound) {
      dispatch({
        type: 'SET_USER',
        payload: isFound
      });
    }
  }
}
