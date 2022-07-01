
// import useSelector and useDispatch from react-redux
import { useEffect,useRef,useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { fetchMessages, fetchRooms, postMessage,addMessage } from './redux/actions';
import { useNavigate } from 'react-router-dom';
const socket = io('http://localhost:3001/');
function App() {
  const dispatch = useDispatch();
  const navigator = useNavigate();
  const { rooms, currentRoom,messages,user } = useSelector(state => state);
  const [onlineUsers,setOnlineUsers] = useState([]);
  const newMessage = useRef(null);
  const handleChangeRoom = (roomId) => {
    dispatch({
      type: 'SET_CURRENT_ROOM',
      payload: roomId
    });
    dispatch(fetchMessages(roomId))
  } 
  const handleNewMessage = (e) => {
    if(e.keyCode === 13 || !e){
      const message = {
        roomsId: currentRoom,
        usersId: user.id,
        message: newMessage.current.value,
        users : {
          name: user.name,
          id: user.id
        }
      }
      newMessage.current.value = '';
      socket.emit('sendMessage',({user : {name: user.name, id:user.id},message:message.message,roomsId:currentRoom}))
      dispatch(postMessage(message));
      dispatch(addMessage(message));
    }
  }
  useEffect(()=>{
    console.log('initial useEffect')
    if(!user && !localStorage.getItem('user')){
      navigator('/login')
    }else if(localStorage.getItem("user")){
      dispatch({type:"SET_USER",payload:JSON.parse(localStorage.getItem("user"))})
      const userId = JSON.parse(localStorage.getItem("user")).id;
      dispatch(fetchRooms(userId));
    }
      
  },[])
  useEffect(()=>{
    if(user?.name){
      socket.emit('joinRoom', ({ user: { name: user.name, id: user.id }, roomsId: currentRoom }));
      socket.emit('get online users', currentRoom);
    }
  },[currentRoom])
  useEffect(() => {
    console.log('socket useEffect')
    socket.on('userJoined', (data) => {
      console.log(`user with id ${data.user.name}, has been joined the room ${data.roomsId}`)
    })
    socket.on('new message', ({ user, message, roomsId }) => {
      console.log(`user ${user.name}, has sent a message ${message} to room ${roomsId}`)
      dispatch(addMessage({
        roomsId: roomsId,
        usersId: user.id,
        message: message,
        users: {
          name: user.name,
          id: user.id
        }
      }))
    })
    socket.on('onlineUsers', (data) => {
      console.log('test')
      if(data[currentRoom]){
        console.log(data)
        console.log(`online users in room ${currentRoom} => ${data[currentRoom].length}`)
        setOnlineUsers(data[currentRoom].length)
      }

    })
  }, [socket])
  return (
    <div className="h-screen w-screen bg-indigo-300 flex space-x-2 p-2">
      <div id="list-rooms" className="p-2 w-[10%] rounded-md rounded-br-md h-full bg-indigo-400 relative">
        <h1 className="underline">Rooms</h1>
        {/* list rooms */}
        <div className="flex flex-col space-y-2 py-5">
          {rooms.map((room, idx) => <button key={room.id}  onClick={e=>handleChangeRoom(room.id)} className={currentRoom != room.id ? "bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded" : "bg-indigo-700 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded"}>
            {room.room}
          </button>
          )}
        </div>
        {/* logged in users */}
        <div className="absolute bottom-0 left-0 flex flex-col space-y-2 py-5 w-full ">
          <button className="bg-indigo-600 w-full hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded">
            {user?.name}
          </button>
          {/* logout */}
          
        </div>
      </div>
      <div id="chat-room" className="p-2 w-[90%] rounded-md rounded-bl-md h-full bg-indigo-400 relative">
        <div className="flex justify-around w-full">
          <h1 className="underline mb-5">Chat Room {currentRoom ? currentRoom : ""}</h1>
          <h1>Online Users {onlineUsers?.length}</h1>
        </div>
        {/* chat room */}
        <div className="px-1 flex flex-col space-y-2 bg-indigo-400 rounded-md max-h-[80%] min-h-[80%] overflow-y-scroll">
          {/* messages */}
          {messages.length == 0 && <div className="text-center text-white">No messages</div>}
          {messages.map((item, idx) => <div key={idx} className={item.usersId != user.id ? "rounded-md bg-indigo-500" : "rounded-md bg-indigo-700 text-right pr-3"}>
            <div className="w-full flex flex-col pl-2 pb-2">
              <span className='text-gray-100 font-bold '>{item?.users?.name} | 08:30</span>
              <span className="pl-3 text-white">{item.message}</span>
            </div>
          </div>)}
        </div>

        {/* input message */}
        <div className="absolute bottom-5  w-full flex flex-col pr-4 space-y-2 rounded-md">
          
          <input ref={newMessage} onKeyDown={e => handleNewMessage(e)}  className="w-full p-2 rounded-md" type="text" placeholder="Type a message..." />
            <button onClick={e=>handleNewMessage()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-2 rounded">
              Send
            </button>
        
          </div>
      </div>
    </div>
  );
}

export default App;
